package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.SalesReportResponse;
import com.ezeiatech.inventory.dto.SalesReportResponse.DailySales;
import com.ezeiatech.inventory.entity.OrderStatus;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReportService {
    static final int MAX_RANGE_DAYS = 366;   // bahut bada range = bhaari query, isliye cap
    static final int DEFAULT_RANGE_DAYS = 30;

    private final OrderRepository orderRepository;
    private final ZoneId zone;
    private final Clock clock;

    @Autowired
    public ReportService(OrderRepository orderRepository, @Value("${app.report.zone}") String zone) {
        this(orderRepository, ZoneId.of(zone), Clock.systemUTC());
    }

    ReportService(OrderRepository orderRepository, ZoneId zone, Clock clock) {
        this.orderRepository = orderRepository;
        this.zone = zone;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public SalesReportResponse sales(LocalDate from, LocalDate to) {
        LocalDate today = LocalDate.now(clock.withZone(zone));
        LocalDate end = to != null ? to : today;
        LocalDate start = from != null ? from : end.minusDays(DEFAULT_RANGE_DAYS - 1);

        if (start.isAfter(end)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "from must not be after to");
        }
        if (ChronoUnit.DAYS.between(start, end) + 1 > MAX_RANGE_DAYS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Date range cannot exceed " + MAX_RANGE_DAYS + " days");
        }

        List<DailySales> daily = orderRepository.salesByDay(
                        zone.getId(), OrderStatus.CANCELLED.name(),
                        start.atStartOfDay(zone).toInstant(),
                        end.plusDays(1).atStartOfDay(zone).toInstant())
                .stream()
                .map(v -> new DailySales(v.getPeriod(), v.getCnt(), v.getSales()))
                .toList();

        // max 366 rows hain, isliye total yahin jod lena sasta hai (extra query nahi)
        long orders = daily.stream().mapToLong(DailySales::orders).sum();
        BigDecimal total = daily.stream().map(DailySales::sales).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avg = orders == 0 ? BigDecimal.ZERO
                : total.divide(BigDecimal.valueOf(orders), 2, RoundingMode.HALF_UP);

        return new SalesReportResponse(start, end, orders, total, avg, daily);
    }
}