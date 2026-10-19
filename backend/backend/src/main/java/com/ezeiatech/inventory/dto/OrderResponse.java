package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.Order;
import com.ezeiatech.inventory.entity.OrderStatus;
import com.ezeiatech.inventory.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@AllArgsConstructor
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

    public static OrderResponse from(Order o) {
        return new OrderResponse(o.getId(), o.getOrderNumber(),
                o.getCustomer().getId(), o.getCustomer().getName(),
                o.getItems().stream().map(OrderItemResponse::from).toList(),
                o.getSubtotal(), o.getTax(), o.getTotal(),
                o.getStatus(), o.getPaymentStatus(), o.getCreatedAt(), o.getUpdatedAt());
    }
}