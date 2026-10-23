package com.ezeiatech.inventory.repository.projection;

import com.ezeiatech.inventory.entity.OrderStatus;

import java.math.BigDecimal;

// Aggregate query ke result rows. Alias single lowercase word rakhe hain taaki native query me bhi match ho.
public final class ReportViews {
    private ReportViews() {}

    public interface StatusCountView {
        OrderStatus getStatus();
        Long getCnt();
    }

    public interface PeriodSalesView {      // month ya day, native query
        String getPeriod();
        Long getCnt();
        BigDecimal getSales();
    }

    public interface TopProductView {
        Long getProductId();
        String getName();
        Long getQuantity();
        BigDecimal getRevenue();
    }
}