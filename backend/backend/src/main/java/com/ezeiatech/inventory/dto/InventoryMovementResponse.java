package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.InventoryMovement;
import com.ezeiatech.inventory.entity.MovementType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class InventoryMovementResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private MovementType type;
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    private Long referenceId;
    private Long createdById;
    private String createdByName;
    private Instant createdAt;

    public static InventoryMovementResponse from(InventoryMovement m) {
        return new InventoryMovementResponse(
                m.getId(),
                m.getProduct().getId(), m.getProduct().getName(), m.getProduct().getSku(),
                m.getType(), m.getQuantity(), m.getPreviousStock(), m.getNewStock(),
                m.getReferenceId(),
                m.getCreatedBy().getId(), m.getCreatedBy().getName(),
                m.getCreatedAt());
    }
}