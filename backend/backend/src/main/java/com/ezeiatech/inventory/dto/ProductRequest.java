package com.ezeiatech.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductRequest {

    @NotBlank
    @Size(max = 150)
    @Pattern(regexp = "^[\\p{L}\\p{N} .,()/+-]+$", message = "Name contains invalid characters")
    private String name;

    @NotBlank
    @Size(max = 50)
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "SKU can have only letters, digits, - and _")
    private String sku;

    @Size(max = 1000)
    @Pattern(regexp = "^[^<>&\"']*$", message = "Description cannot contain < > & \" '")
    private String description;

    @NotNull
    private Long categoryId;

    @NotNull
    private Long supplierId;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "must be greater than 0")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal price;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true, message = "must be 0 or more")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal costPrice;

    @NotNull
    @Min(0)
    private Integer stock;

    @NotNull
    @Min(0)
    private Integer reorderLevel;
}
