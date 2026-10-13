package com.ezeiatech.inventory.dto;

import com.ezeiatech.inventory.entity.Role;
import com.ezeiatech.inventory.entity.User;
import com.ezeiatech.inventory.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
    private Instant createdAt;

    public static UserResponse from(User u){
        return new UserResponse(u.getId(),u.getName(),u.getEmail(),u.getRole(),u.getStatus(),u.getCreatedAt());
    }
}
