package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.OrderHistory;
import com.ezeiatech.inventory.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class OrderHistoryResponse {
    private OrderStatus oldStatus;
    private OrderStatus newStatus;
    private Long changeById;
    private String changeByName;
    private Instant createdAt;

    public static OrderHistoryResponse from(OrderHistory h){
        return new OrderHistoryResponse(h.getOldStatus(),h.getNewStatus(),h.getChangedBy().getId()
        ,h.getChangedBy().getName(),h.getCreatedAt());
    }
}
