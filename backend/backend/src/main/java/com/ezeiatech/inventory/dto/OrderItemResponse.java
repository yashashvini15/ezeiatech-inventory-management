package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private String sku;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal lineTotal;

    public static OrderItemResponse from(OrderItem i) {
        return new OrderItemResponse(i.getProduct().getId(), i.getProductName(), i.getSku(),
                i.getUnitPrice(), i.getQuantity(), i.getLineTotal());
    }
}