package com.ezeiatech.inventory.controller;

import com.ezeiatech.inventory.dto.ApiResponse;
import com.ezeiatech.inventory.dto.DashboardStatsResponse;
import com.ezeiatech.inventory.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> stats(Authentication authentication) {
        // role token se aata hai (server-side), client se nahi. Staff ko sales fields mil hi nahi sakte.
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(ApiResponse.ok("Ok", dashboardService.getStats(admin)));
    }
}