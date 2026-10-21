package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {
    @NotNull
    private OrderStatus status;
}
