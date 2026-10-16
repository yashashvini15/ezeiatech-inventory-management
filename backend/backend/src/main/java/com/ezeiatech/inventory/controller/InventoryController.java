package com.ezeiatech.inventory.controller;

import com.ezeiatech.inventory.dto.AddStockRequest;
import com.ezeiatech.inventory.dto.ApiResponse;
import com.ezeiatech.inventory.dto.InventoryMovementResponse;
import com.ezeiatech.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InventoryMovementResponse>> add(
            @Valid @RequestBody AddStockRequest req, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).
                body(ApiResponse.ok("Stock added",
                        inventoryService.addStock(req, authentication.getName())));
    }
}