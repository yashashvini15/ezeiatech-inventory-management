package com.ezeiatech.inventory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddStockRequest {

    @NotNull
    private Long productId;

    @NotNull
    @Min(value = 1, message = "must be greater than 0")
    @Max(value = 1000000, message = "must not exceed 1000000")
    private Integer quantity;
}