package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.RestockRequest;
import com.ezeiatech.inventory.entity.RestockStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class RestockRequestResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer requestedQuantity;
    private String note;
    private RestockStatus status;
    private Long requestedById;
    private String requestedByName;
    private Instant createdAt;
    private Instant resolvedAt;

    public static RestockRequestResponse from(RestockRequest r) {
        return new RestockRequestResponse(r.getId(),
                r.getProduct().getId(), r.getProduct().getName(), r.getProduct().getSku(),
                r.getProduct().getStock(), r.getProduct().getReorderLevel(),
                r.getQuantity(), r.getNote(), r.getStatus(),
                r.getRequestedBy().getId(), r.getRequestedBy().getName(),
                r.getCreatedAt(), r.getResolvedAt());
    }
}