package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.Status;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    @Size(max = 100,message = "Name must be at most 100 characters")
    @Pattern(regexp = "^[^<>]*$", message = "Name must not contain < or >")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 150,message = "Email must be at most 150 characters")
    private String email;

    @Pattern(regexp = "^[0-9+\\- ]{7,15}$", message = "Phone must be 7-15 digits")
    private String phone;

    @Size(max = 300, message = "Address must be at most 300 character")
    @Pattern(regexp = "^[^<>]*$", message = "Address must not contain < or >")
    private String address;

    // optional: sirf update mein use hoga (ACTIVE/INACTIVE). Null ho to status change nahi hoga.
    private Status status;
}
