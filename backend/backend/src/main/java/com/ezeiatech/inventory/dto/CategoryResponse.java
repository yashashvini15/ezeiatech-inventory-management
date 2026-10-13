package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.Category;
import com.ezeiatech.inventory.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private Status status;
    private Instant createdAt;

    public static CategoryResponse from(Category c){
        return new CategoryResponse(c.getId(),c.getName(), c.getDescription(), c.getStatus(), c.getCreatedAt());
    }
}
