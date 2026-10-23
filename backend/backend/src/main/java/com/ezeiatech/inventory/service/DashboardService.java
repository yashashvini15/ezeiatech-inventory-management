package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.DashboardStatsResponse;
import com.ezeiatech.inventory.dto.DashboardStatsResponse.MonthlySales;
import com.ezeiatech.inventory.dto.DashboardStatsResponse.StatusCount;
import com.ezeiatech.inventory.dto.DashboardStatsResponse.TopProduct;
import com.ezeiatech.inventory.entity.OrderStatus;
import com.ezeiatech.inventory.entity.Role;
import com.ezeiatech.inventory.repository.OrderRepository;
import com.ezeiatech.inventory.repository.ProductRepository;
import com.ezeiatech.inventory.repository.UserRepository;
import com.ezeiatech.inventory.repository.projection.ReportViews.PeriodSalesView;
import com.ezeiatech.inventory.repository.projection.ReportViews.StatusCountView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DashboardService {
    // "Pending" = abhi process baaki (DELIVERED / CANCELLED nahi)
    static final Set<OrderStatus> PENDING =
            EnumSet.of(OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PACKED, OrderStatus.SHIPPED);
    static final int TOP_N = 5;
    static final int MONTHS = 12;
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ZoneId zone;
    private final Clock clock;

    @Autowired   // 2 constructor hain, isliye Spring ko batana padta hai kaun sa use kare
    public DashboardService(OrderRepository orderRepository, ProductRepository productRepository,
                            UserRepository userRepository,
                            @Value("${app.report.zone}") String zone) {
        this(orderRepository, productRepository, userRepository, ZoneId.of(zone), Clock.systemUTC());
    }

    // test ke liye: fixed Clock inject ho sake
    DashboardService(OrderRepository orderRepository, ProductRepository productRepository,
                     UserRepository userRepository, ZoneId zone, Clock clock) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.zone = zone;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(boolean admin) {
        // 1 query: sab statuses ka count. Missing status = 0.
        Map<OrderStatus, Long> byStatus = new EnumMap<>(OrderStatus.class);
        for (OrderStatus s : OrderStatus.values()) byStatus.put(s, 0L);
        for (StatusCountView v : orderRepository.countGroupedByStatus()) byStatus.put(v.getStatus(), v.getCnt());

        List<StatusCount> statusCounts = byStatus.entrySet().stream()
                .map(e -> new StatusCount(e.getKey(), e.getValue())).toList();
        long totalOrders = byStatus.values().stream().mapToLong(Long::longValue).sum();
        long pending = PENDING.stream().mapToLong(byStatus::get).sum();
        long delivered = byStatus.get(OrderStatus.DELIVERED);

        BigDecimal totalSales = null;
        List<MonthlySales> monthly = null;
        if (admin) {
            BigDecimal sum = orderRepository.sumTotalExcluding(OrderStatus.CANCELLED);
            totalSales = sum == null ? BigDecimal.ZERO : sum;
            monthly = buildMonthly();
        }

        List<TopProduct> top = orderRepository
                .findTopProducts(OrderStatus.CANCELLED, PageRequest.of(0, TOP_N)).stream()
                .map(v -> new TopProduct(v.getProductId(), v.getName(), v.getSku(), v.getQuantity(),
                        admin ? v.getRevenue() : null))
                .toList();

        return new DashboardStatsResponse(
                productRepository.count(),
                userRepository.countByRole(Role.CUSTOMER),
                totalOrders, totalSales,
                productRepository.countLowStock(),
                pending, delivered,
                statusCounts, monthly, top);
    }

    // Pichle 12 mahine (current mila ke). DB group by karta hai; yahan sirf khaali mahine 0 se bharte hain.
    private List<MonthlySales> buildMonthly() {
        YearMonth current = YearMonth.now(clock.withZone(zone));
        YearMonth start = current.minusMonths(MONTHS - 1);

        Map<String, BigDecimal> fromDb = new HashMap<>();
        for (PeriodSalesView v : orderRepository.salesByMonth(
                zone.getId(), OrderStatus.CANCELLED.name(),
                start.atDay(1).atStartOfDay(zone).toInstant())) {
            fromDb.put(v.getPeriod(), v.getSales());
        }

        List<MonthlySales> out = new ArrayList<>(MONTHS);
        for (int i = 0; i < MONTHS; i++) {
            String key = start.plusMonths(i).format(MONTH_FMT);
            out.add(new MonthlySales(key, fromDb.getOrDefault(key, BigDecimal.ZERO)));
        }
        return out;
    }
}