package com.ezeiatech.inventory.controller;

import com.ezeiatech.inventory.dto.ApiResponse;
import com.ezeiatech.inventory.dto.CreateRestockRequest;
import com.ezeiatech.inventory.dto.PageResponse;
import com.ezeiatech.inventory.dto.RestockRequestResponse;
import com.ezeiatech.inventory.entity.RestockStatus;
import com.ezeiatech.inventory.service.RestockRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restock-requests")
@RequiredArgsConstructor
public class RestockRequestController {
    private final RestockRequestService restockService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<RestockRequestResponse>> create(@Valid @RequestBody CreateRestockRequest request,
                                                                      Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Restock requested", restockService.create(authentication.getName(), request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<RestockRequestResponse>>> list(
            @RequestParam(required = false) RestockStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok("Ok", restockService.list(status, page, limit)));
    }

    @PatchMapping("/{id}/dismiss")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RestockRequestResponse>> dismiss(@PathVariable Long id,
                                                                       Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok("Request dismissed", restockService.dismiss(authentication.getName(), id)));
    }
}