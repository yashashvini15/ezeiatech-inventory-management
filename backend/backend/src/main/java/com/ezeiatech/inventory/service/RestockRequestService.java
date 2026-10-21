package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.CreateRestockRequest;
import com.ezeiatech.inventory.dto.PageResponse;
import com.ezeiatech.inventory.dto.RestockRequestResponse;
import com.ezeiatech.inventory.entity.*;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.ProductRepository;
import com.ezeiatech.inventory.repository.RestockRequestRepository;
import com.ezeiatech.inventory.repository.UserRepository;
import com.ezeiatech.inventory.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RestockRequestService {
    private final RestockRequestRepository restockRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public RestockRequestResponse create(String email, CreateRestockRequest request) {
        User staff = currentUser(email);

        // product row lock: do staff ek saath bhejein to bhi ek hi OPEN request banegi
        Product p = productRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        if (p.getStatus() != ProductStatus.ACTIVE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product is inactive");
        }
        if (p.getStock() > p.getReorderLevel()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product is not low on stock");
        }
        if (restockRepository.existsByProductIdAndStatus(p.getId(), RestockStatus.OPEN)) {
            throw new ApiException(HttpStatus.CONFLICT, "Restock already requested for this product");
        }

        RestockRequest r = new RestockRequest();
        r.setProduct(p);
        r.setRequestedBy(staff);
        r.setQuantity(request.getQuantity());
        r.setNote(InputSanitizer.clean(request.getNote()));
        return RestockRequestResponse.from(restockRepository.save(r));
    }

    @Transactional(readOnly = true)
    public PageResponse<RestockRequestResponse> list(RestockStatus status, int page, int limit) {
        if (page < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "page must be 1 or more");
        }
        if (limit < 1 || limit > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "limit must be between 1 and 100");
        }
        Pageable pageable = PageRequest.of(page - 1, limit,
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));

        Page<RestockRequest> result = status == null
                ? restockRepository.findAll(pageable)
                : restockRepository.findByStatus(status, pageable);
        return PageResponse.from(result.map(RestockRequestResponse::from));
    }

    @Transactional
    public RestockRequestResponse dismiss(String email, Long id) {
        User admin = currentUser(email);
        RestockRequest r = restockRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Restock request not found"));
        if (r.getStatus() != RestockStatus.OPEN) {
            throw new ApiException(HttpStatus.CONFLICT, "Request is already " + r.getStatus());
        }
        r.setStatus(RestockStatus.DISMISSED);
        r.setResolvedAt(Instant.now());
        r.setResolvedBy(admin);
        return RestockRequestResponse.from(r);
    }

    // InventoryService.addStock isko call karega. Stock reorderLevel se upar gaya to OPEN requests FULFILLED.
    @Transactional
    public void fulfillOpenFor(Product product, User admin) {
        if (product.getStock() <= product.getReorderLevel()) {
            return;   // abhi bhi low hai, request OPEN rehne do
        }
        for (RestockRequest r : restockRepository.findByProductIdAndStatus(product.getId(), RestockStatus.OPEN)) {
            r.setStatus(RestockStatus.FULFILLED);
            r.setResolvedAt(Instant.now());
            r.setResolvedBy(admin);
        }
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }
}