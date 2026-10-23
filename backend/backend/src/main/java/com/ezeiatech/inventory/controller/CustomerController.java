package com.ezeiatech.inventory.controller;

import com.ezeiatech.inventory.dto.ApiResponse;
import com.ezeiatech.inventory.dto.CustomerStatusRequest;
import com.ezeiatech.inventory.dto.PageResponse;
import com.ezeiatech.inventory.dto.UserResponse;
import com.ezeiatech.inventory.entity.UserStatus;
import com.ezeiatech.inventory.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok("Ok", customerService.list(search, status, page, limit)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(@PathVariable Long id,
                                                                  @Valid @RequestBody CustomerStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Customer status updated",
                customerService.updateStatus(id, request.getStatus())));
    }
}