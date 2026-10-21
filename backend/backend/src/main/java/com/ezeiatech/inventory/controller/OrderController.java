package com.ezeiatech.inventory.controller;

import com.ezeiatech.inventory.dto.*;
import com.ezeiatech.inventory.entity.OrderStatus;
import com.ezeiatech.inventory.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponse>> create(@Valid @RequestBody CreateOrderRequest request,
                                                             Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed", orderService.create(authentication.getName(), request)));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<OrderSummaryResponse>>> list(
            Authentication authentication,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok("Ok",
                orderService.list(authentication.getName(), page, limit, status, search, customerId, from, to)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> get(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok("Ok", orderService.getById(authentication.getName(), id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(@PathVariable Long id,
                                                                   @Valid @RequestBody UpdateOrderStatusRequest request,
                                                                   Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated",
                orderService.updateStatus(authentication.getName(), id, request)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled", orderService.cancel(authentication.getName(), id)));
    }
}