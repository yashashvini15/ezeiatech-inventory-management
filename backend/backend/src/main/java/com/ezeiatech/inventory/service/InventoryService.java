package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.AddStockRequest;
import com.ezeiatech.inventory.dto.InventoryMovementResponse;
import com.ezeiatech.inventory.dto.ProductResponse;
import com.ezeiatech.inventory.entity.InventoryMovement;
import com.ezeiatech.inventory.entity.MovementType;
import com.ezeiatech.inventory.entity.Product;
import com.ezeiatech.inventory.entity.User;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.InventoryMovementRepository;
import com.ezeiatech.inventory.repository.ProductRepository;
import com.ezeiatech.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final ProductRepository productRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final UserRepository userRepository;

    // Admin stock add karta hai
    @Transactional
    public InventoryMovementResponse addStock(AddStockRequest req, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        // FOR UPDATE: jab tak ye transaction chalti hai, doosra koi is product ka stock nahi badal sakta
        Product product = productRepository.findByIdForUpdate(req.getProductId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        InventoryMovement movement =
                changeStock(product, MovementType.STOCK_IN, req.getQuantity(), null, user);
        return InventoryMovementResponse.from(movement);
    }

    @Transactional(readOnly = true)
    public Page<InventoryMovementResponse> getMovements(Long productId, MovementType type,
                                                        LocalDate from, LocalDate to,
                                                        Pageable pageable) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "from must not be after to");
        }

        Specification<InventoryMovement> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (productId != null) {
                predicates.add(cb.equal(root.get("product").get("id"), productId));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"),
                        from.atStartOfDay().toInstant(ZoneOffset.UTC)));
            }
            if (to != null) {
                // to wali date ka poora din shamil: next din ke start se pehle tak
                predicates.add(cb.lessThan(root.get("createdAt"),
                        to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return inventoryMovementRepository.findAll(spec, pageable).map(InventoryMovementResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getLowStock(Pageable pageable) {
        return productRepository.findLowStock(pageable).map(ProductResponse::from);
    }

    // Stock badalne ka EKLAUTA tareeka. Day 5 me order create/cancel bhi yahi use karenge.
    // Caller ki transaction ke andar chalna chahiye (product pehle lock hua ho).
    @Transactional
    public InventoryMovement changeStock(Product product, MovementType type, int quantity,
                                         Long referenceId, User user) {
        int previous = product.getStock();
        long updated = (long) previous + (long) type.getSign() * quantity;   // long: overflow se bachav

        if (updated < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient stock");
        }
        if (updated > Integer.MAX_VALUE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Stock limit exceeded");
        }

        product.setStock((int) updated);   // @Transactional me entity managed hai, save() ki zarurat nahi

        InventoryMovement m = new InventoryMovement();
        m.setProduct(product);
        m.setType(type);
        m.setQuantity(quantity);
        m.setPreviousStock(previous);
        m.setNewStock((int) updated);
        m.setReferenceId(referenceId);
        m.setCreatedBy(user);
        return inventoryMovementRepository.save(m);
    }
}
