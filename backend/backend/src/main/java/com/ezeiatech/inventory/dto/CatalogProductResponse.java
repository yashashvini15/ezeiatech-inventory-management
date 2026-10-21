package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@AllArgsConstructor
public class CatalogProductResponse {
    private Long id;
    private String name;
    private String sku;
    private String description;
    private Long categoryId;
    private String categoryName;
    private BigDecimal price;
    private Integer stock;
    private Instant createdAt;

    public static CatalogProductResponse from(Product p) {
        return new CatalogProductResponse(p.getId(), p.getName(), p.getSku(), p.getDescription(),
                p.getCategory().getId(), p.getCategory().getName(),
                p.getPrice(), p.getStock(), p.getCreatedAt());
    }
}