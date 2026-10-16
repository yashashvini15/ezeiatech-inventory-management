package com.ezeiatech.inventory.controller;

import com.ezeiatech.inventory.dto.AddStockRequest;
import com.ezeiatech.inventory.dto.ApiResponse;
import com.ezeiatech.inventory.dto.InventoryMovementResponse;
import com.ezeiatech.inventory.dto.ProductResponse;
import com.ezeiatech.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.ezeiatech.inventory.entity.MovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

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

    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<Page<InventoryMovementResponse>>> movements(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) MovementType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {

        int safePage = Math.max(page, 0);
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        PageRequest pageable = PageRequest.of(safePage, safeLimit,
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));

        return ResponseEntity.ok(ApiResponse.ok("Ok",
                inventoryService.getMovements(productId, type, from, to, pageable)));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> lowStock(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {

        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(limit, 1), 100),
                Sort.by("stock").ascending());
        return ResponseEntity.ok(ApiResponse.ok("Ok", inventoryService.getLowStock(pageable)));
    }
}