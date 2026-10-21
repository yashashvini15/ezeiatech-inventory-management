package com.ezeiatech.inventory.controller;

import com.ezeiatech.inventory.dto.ApiResponse;
import com.ezeiatech.inventory.dto.CatalogProductResponse;
import com.ezeiatech.inventory.dto.PageResponse;
import com.ezeiatech.inventory.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/catalog/products")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CatalogController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CatalogProductResponse>>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        return ResponseEntity.ok(ApiResponse.ok("Ok",
                productService.catalog(page, limit, search, categoryId, minPrice, maxPrice, sortBy, direction)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CatalogProductResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Ok", productService.catalogGet(id)));
    }
}