package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.Order;
import com.ezeiatech.inventory.entity.OrderStatus;
import com.ezeiatech.inventory.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@AllArgsConstructor
public class OrderSummaryResponse {
    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private int itemCount;
    private BigDecimal total;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private Instant createdAt;

    public static OrderSummaryResponse from(Order o) {
        return new OrderSummaryResponse(o.getId(), o.getOrderNumber(),
                o.getCustomer().getId(), o.getCustomer().getName(),
                o.getItems().size(), o.getTotal(), o.getStatus(), o.getPaymentStatus(), o.getCreatedAt());
    }
}