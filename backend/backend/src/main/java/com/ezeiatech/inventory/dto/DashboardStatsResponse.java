package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.OrderStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

// NON_NULL: STAFF ke liye totalSales / salesByMonth / revenue response me aate hi nahi
@JsonInclude(JsonInclude.Include.NON_NULL)
public record DashboardStatsResponse(
        long totalProducts,
        long totalCustomers,
        long totalOrders,
        BigDecimal totalSales,              // ADMIN only
        long lowStockProducts,
        long pendingOrders,
        long deliveredOrders,
        List<StatusCount> ordersByStatus,
        List<MonthlySales> salesByMonth,    // ADMIN only
        List<TopProduct> topProducts) {

    public record StatusCount(OrderStatus status, long count) {}

    public record MonthlySales(String month, BigDecimal sales) {}      // month = "2026-10"

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record TopProduct(Long productId, String name, String sku, long quantity, BigDecimal revenue) {}  // revenue ADMIN only
}