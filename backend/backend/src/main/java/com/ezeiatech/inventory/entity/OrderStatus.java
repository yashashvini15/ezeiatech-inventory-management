package com.ezeiatech.inventory.entity;

public enum OrderStatus {
    PLACED, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED;

    // seedha agla allowed status. DELIVERED aur CANCELLED ke baad kuch nahi (null)
    public OrderStatus next() {
        return switch (this) {
            case PLACED -> CONFIRMED;
            case CONFIRMED -> PACKED;
            case PACKED -> SHIPPED;
            case SHIPPED -> DELIVERED;
            case DELIVERED, CANCELLED -> null;
        };
    }
}