package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerStatusRequest {
    @NotNull
    private UserStatus status;
}