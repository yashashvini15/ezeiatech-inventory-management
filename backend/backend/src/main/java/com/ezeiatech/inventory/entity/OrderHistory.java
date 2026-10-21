package com.ezeiatech.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "order_history", indexes = @Index(name = "idx_history_order", columnList = "order_id"))
@Getter
@Setter
@NoArgsConstructor
public class OrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // RELATION 5: Bahut history rows -> ek order
    // Order me List<OrderHistory> nahi rakhi (zaroorat nahi, repository se query karenge).
    // Isse relation "one-directional" hai: sirf history order ko jaanti hai.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Pehli entry (order bana) me null, kyunki "pehle ka status" tha hi nahi
    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private OrderStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private OrderStatus newStatus;

    // RELATION 6: Bahut history rows -> ek user (kisne status badla: customer/staff/admin)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}