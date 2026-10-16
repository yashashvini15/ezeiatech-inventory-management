package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.AddStockRequest;
import com.ezeiatech.inventory.dto.InventoryMovementResponse;
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
