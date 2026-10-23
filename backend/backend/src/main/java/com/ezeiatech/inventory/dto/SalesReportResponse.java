package com.ezeiatech.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SalesReportResponse(
        LocalDate from,
        LocalDate to,
        long totalOrders,
        BigDecimal totalSales,
        BigDecimal averageOrderValue,
        List<DailySales> daily) {

    public record DailySales(String date, long orders, BigDecimal sales) {}
}