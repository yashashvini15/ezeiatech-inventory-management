package com.ezeiatech.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateOrderRequest {

    @NotEmpty(message = "must contain at least one item")
    @Size(max = 50, message = "at most 50 items")
    @Valid
    private List<OrderItemRequest> items;
}