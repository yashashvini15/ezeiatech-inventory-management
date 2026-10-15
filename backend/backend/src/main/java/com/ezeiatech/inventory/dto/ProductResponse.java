package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.Product;
import com.ezeiatech.inventory.entity.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String sku;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long supplierId;
    private String supplierName;
    private BigDecimal price;
    private BigDecimal costPrice;
    private Integer stock;
    private Integer reorderLevel;
    private boolean lowStock;
    private ProductStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getSku(), p.getDescription(),
                p.getCategory().getId(), p.getCategory().getName(),
                p.getSupplier().getId(), p.getSupplier().getName(),
                p.getPrice(), p.getCostPrice(), p.getStock(), p.getReorderLevel(),
                p.getStock() <= p.getReorderLevel(),
                p.getStatus(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
