package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.Order;
import com.ezeiatech.inventory.entity.OrderHistory;
import com.ezeiatech.inventory.entity.OrderStatus;
import com.ezeiatech.inventory.entity.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal total;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private Instant createdAt;
    private Instant updatedAt;
    private List<OrderHistoryResponse> history;   // sirf detail/status/cancel response me, create me nahi

    public static OrderResponse from(Order o) {
        return from(o, null);
    }

    public static OrderResponse from(Order o, List<OrderHistory> history) {
        return new OrderResponse(o.getId(), o.getOrderNumber(),
                o.getCustomer().getId(), o.getCustomer().getName(),
                o.getItems().stream().map(OrderItemResponse::from).toList(),
                o.getSubtotal(), o.getTax(), o.getTotal(),
                o.getStatus(), o.getPaymentStatus(), o.getCreatedAt(), o.getUpdatedAt(),
                history == null ? null : history.stream().map(OrderHistoryResponse::from).toList());
    }
}