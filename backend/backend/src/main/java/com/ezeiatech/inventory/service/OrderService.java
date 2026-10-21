package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.*;
import com.ezeiatech.inventory.entity.*;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.OrderHistoryRepository;
import com.ezeiatech.inventory.repository.OrderRepository;
import com.ezeiatech.inventory.repository.ProductRepository;
import com.ezeiatech.inventory.repository.UserRepository;
import com.ezeiatech.inventory.specification.OrderSpecs;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    // kaun se status se cancel ho sakta hai (brief: PLACED -> CANCELLED). Badalna ho to yahin
    private static final Set<OrderStatus> CANCELLABLE = EnumSet.of(OrderStatus.PLACED);

    private final OrderRepository orderRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;

    @Value("${app.order.tax-rate}")
    private BigDecimal taxRate;

    // ---------------- CREATE (Phase A, same) ----------------
    @Transactional
    public OrderResponse create(String email, CreateOrderRequest request) {
        User customer = currentUser(email);

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
        orderRepository.save(order);

        for (Product p : products) {
            inventoryService.changeStock(p, MovementType.ORDER_PLACED,
                    wanted.get(p.getId()), order.getId(), customer);
        }

        recordHistory(order, null, OrderStatus.PLACED, customer);
        return OrderResponse.from(order);
    }

    // ---------------- LIST (role-based) ----------------
    @Transactional(readOnly = true)
    public PageResponse<OrderSummaryResponse> list(String email, int page, int limit, OrderStatus status,
                                                   String search, Long customerId, LocalDate from, LocalDate to) {
        User user = currentUser(email);

        if (page < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "page must be 1 or more");
        }
        if (limit < 1 || limit > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "limit must be between 1 and 100");
        }
        if (from != null && to != null && from.isAfter(to)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "from must not be after to");
        }

        // CUSTOMER ko hamesha sirf apne orders; customerId param ignore
        Long effectiveCustomerId = user.getRole() == Role.CUSTOMER ? user.getId() : customerId;

        Pageable pageable = PageRequest.of(page - 1, limit,
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));

        Page<Order> result = orderRepository.findAll(
                OrderSpecs.filter(effectiveCustomerId, status, search, from, to), pageable);
        return PageResponse.from(result.map(OrderSummaryResponse::from));
    }

    // ---------------- DETAIL ----------------
    @Transactional(readOnly = true)
    public OrderResponse getById(String email, Long id) {
        User user = currentUser(email);
        Order order = orderRepository.findById(id).orElseThrow(OrderService::notFound);
        ensureCanAccess(user, order);
        return OrderResponse.from(order, orderHistoryRepository.findByOrderId(id));
    }

    // ---------------- STATUS UPDATE (Admin/Staff) ----------------
    @Transactional
    public OrderResponse updateStatus(String email, Long id, UpdateOrderStatusRequest request) {
        User actor = currentUser(email);
        OrderStatus target = request.getStatus();

        if (target == OrderStatus.CANCELLED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Use POST /api/orders/{id}/cancel to cancel an order");
        }

        Order order = orderRepository.findByIdForUpdate(id).orElseThrow(OrderService::notFound);
        OrderStatus current = order.getStatus();

        if (current.next() != target) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Invalid status change: " + current + " -> " + target);
        }

        order.setStatus(target);
        if (target == OrderStatus.DELIVERED && order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.PAID);   // COD: delivery par paise mile
        }
        recordHistory(order, current, target, actor);

        return OrderResponse.from(order, orderHistoryRepository.findByOrderId(id));
    }

    // ---------------- CANCEL (stock restore) ----------------
    @Transactional
    public OrderResponse cancel(String email, Long id) {
        User actor = currentUser(email);
        Order order = orderRepository.findByIdForUpdate(id).orElseThrow(OrderService::notFound);
        ensureCanAccess(actor, order);

        OrderStatus current = order.getStatus();
        if (!CANCELLABLE.contains(current)) {
            throw new ApiException(HttpStatus.CONFLICT, "Order cannot be cancelled when it is " + current);
        }

        // products id ke order me lock (create jaisa), phir stock wapas
        List<OrderItem> items = new ArrayList<>(order.getItems());
        items.sort(Comparator.comparing((OrderItem i) -> i.getProduct().getId()));
        for (OrderItem item : items) {
            Product p = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
            inventoryService.changeStock(p, MovementType.ORDER_CANCELLED,
                    item.getQuantity(), order.getId(), actor);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(order.getPaymentStatus() == PaymentStatus.PAID
                ? PaymentStatus.REFUNDED : PaymentStatus.CANCELLED);
        recordHistory(order, current, OrderStatus.CANCELLED, actor);

        return OrderResponse.from(order, orderHistoryRepository.findByOrderId(id));
    }

    // ---------------- helpers ----------------
    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }

    // customer ko doosre ka order 404 dikhta hai (403 nahi), taaki order id exist karti hai ye bhi pata na chale
    private void ensureCanAccess(User user, Order order) {
        if (user.getRole() == Role.CUSTOMER && !order.getCustomer().getId().equals(user.getId())) {
            throw notFound();
        }
    }

    private static ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "Order not found");
    }

    private void recordHistory(Order order, OrderStatus oldStatus, OrderStatus newStatus, User by) {
        OrderHistory h = new OrderHistory();
        h.setOrder(order);
        h.setOldStatus(oldStatus);
        h.setNewStatus(newStatus);
        h.setChangedBy(by);
        orderHistoryRepository.save(h);
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