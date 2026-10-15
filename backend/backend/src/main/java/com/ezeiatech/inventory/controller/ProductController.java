package com.ezeiatech.inventory.controller;

import com.ezeiatech.inventory.dto.ApiResponse;
import com.ezeiatech.inventory.dto.ProductRequest;
import com.ezeiatech.inventory.dto.ProductResponse;
import com.ezeiatech.inventory.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Product created", productService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable Long id,
                                                               @Valid @RequestBody ProductRequest req){
        return ResponseEntity.ok(ApiResponse.ok("Product updated", productService.update(id,req)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<ProductResponse>> get(@PathVariable Long id){
        return ResponseEntity.ok(ApiResponse.ok("OK", productService.getById(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id){
        productService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deactivated", null));
    }

}
