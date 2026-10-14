package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.Status;
import com.ezeiatech.inventory.entity.Supplier;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class SupplierResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private Status status;
    private Instant createdAt;

    public static SupplierResponse from(Supplier s){
        return new SupplierResponse(s.getId(),s.getName(),s.getEmail(),s.getPhone()
        ,s.getAddress(),s.getStatus(),s.getCreatedAt());
    }
}
