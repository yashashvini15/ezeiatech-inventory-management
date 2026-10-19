package com.ezeiatech.inventory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemRequest {

    @NotNull
    private Long productId;

    @NotNull
    @Min(value = 1, message = "must be greater than 0")
    @Max(value = 1000, message = "must be at most 1000")
    private Integer quantity;
}