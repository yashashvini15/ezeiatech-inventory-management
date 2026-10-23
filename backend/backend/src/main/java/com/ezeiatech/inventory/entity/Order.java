package com.ezeiatech.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.BatchSize;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
// "order" SQL ka reserved word hai (ORDER BY), isliye table ka naam "orders"
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_customer", columnList = "customer_id"), // "mere orders" jaldi mile
        @Index(name = "idx_orders_status", columnList = "status"), // status se filter jaldi ho
        @Index(name = "idx_orders_created_at", columnList = "created_at")// date range / monthly report jaldi ho
})
@Getter
@Setter
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String orderNumber;               // ORD-20261018-K7M2PQ

    // RELATION 1: Bahut orders -> ek customer (MANY orders : ONE user)
    // FK "customer_id" orders table me hai. Isliye yahi side FK ki owner hai.
    // LAZY = customer tab load ho jab tum order.getCustomer() bulao.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // RELATION 2: Ek order -> bahut items (ONE order : MANY items)
    // mappedBy = "order": FK yahan nahi, OrderItem.order field me hai.
    //   Yahi line batati hai ki alag join table mat banao.
    // cascade = ALL: order save/delete karo to items bhi apne aap save/delete.
    // orphanRemoval = true: list se item hata do to DB se bhi delete.
    @BatchSize(size = 50)   // 10 orders ke items ek hi query me aayein (N+1 nahi)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal subtotal;              // items ka total, tax se pehle

    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal tax;

    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal total;                 // subtotal + tax

    // STRING = DB me "PLACED" text jayega. (ORDINAL = 0,1,2 number jata, enum ka order
    // badalte hi purana data galat ho jata. Isliye hamesha STRING.)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private OrderStatus status = OrderStatus.PLACED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    // Helper: dono taraf ka link ek saath set karta hai.
    // Sirf items.add() karoge to item.order null rahega aur DB error aayega.
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}