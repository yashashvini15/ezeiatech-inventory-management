package com.ezeiatech.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRestockRequest {

    @NotNull
    private Long productId;

    @NotNull
    @Min(value = 1, message = "must be greater than 0")
    @Max(value = 100000, message = "must be at most 100000")
    private Integer quantity;

    @Size(max = 300, message = "must be at most 300 characters")
    @Pattern(regexp = "^[^<>&\"']*$", message = "cannot contain < > & \" '")
    private String note;
}