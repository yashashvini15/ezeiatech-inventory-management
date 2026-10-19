package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.CreateOrderRequest;
import com.ezeiatech.inventory.dto.OrderItemRequest;
import com.ezeiatech.inventory.dto.OrderResponse;
import com.ezeiatech.inventory.entity.*;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.OrderHistoryRepository;
import com.ezeiatech.inventory.repository.OrderRepository;
import com.ezeiatech.inventory.repository.ProductRepository;
import com.ezeiatech.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class OrderService {
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrderRepository orderRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;

    @Value("${app.order.tax-rate}")
    private BigDecimal taxRate;

    @Transactional
    public OrderResponse create(String email, CreateOrderRequest request) {
        User customer = userRepository.findByEmail(email)
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));

        // same product do baar aaye to quantity jod do; TreeMap = hamesha id ke order me (deadlock se bachav)
        Map<Long, Integer> wanted = new TreeMap<>();
        for (OrderItemRequest i : request.getItems()) {
            wanted.merge(i.getProductId(), i.getQuantity(), Integer::sum);
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderNumber(newOrderNumber());

        List<Product> products = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> e : wanted.entrySet()) {
            Product p = productRepository.findByIdForUpdate(e.getKey())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found: " + e.getKey()));
            int qty = e.getValue();

            if (p.getStatus() != ProductStatus.ACTIVE) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Product not available: " + p.getName());
            }
            if (p.getStock() < qty) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "Insufficient stock for " + p.getName() + " (available: " + p.getStock() + ")");
            }

            // price hamesha DB se, frontend ka price kabhi nahi
            BigDecimal line = p.getPrice().multiply(BigDecimal.valueOf(qty));

            OrderItem item = new OrderItem();
            item.setProduct(p);
            item.setProductName(p.getName());
            item.setSku(p.getSku());
            item.setUnitPrice(p.getPrice());
            item.setQuantity(qty);
            item.setLineTotal(line);
            order.addItem(item);

            products.add(p);
            subtotal = subtotal.add(line);
        }

        BigDecimal tax = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setTotal(subtotal.add(tax));
        orderRepository.save(order);   // IDENTITY: insert turant hota hai, order.getId() mil jata hai

        for (Product p : products) {
            inventoryService.changeStock(p, MovementType.ORDER_PLACED,
                    wanted.get(p.getId()), order.getId(), customer);
        }

        OrderHistory h = new OrderHistory();
        h.setOrder(order);
        h.setOldStatus(null);
        h.setNewStatus(OrderStatus.PLACED);
        h.setChangedBy(customer);
        orderHistoryRepository.save(h);

        return OrderResponse.from(order);
    }

    private static String newOrderNumber() {
        StringBuilder sb = new StringBuilder("ORD-")
                .append(LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)).append('-');
        for (int i = 0; i < 6; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}