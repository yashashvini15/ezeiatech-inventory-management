package com.ezeiatech.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // RELATION 3: Bahut items -> ek order (MANY items : ONE order)
    // Ye Order.items ka doosra half hai. FK "order_id" yahan hai.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // RELATION 4: Bahut items -> ek product (MANY items : ONE product)
    // Ek product 100 alag orders ke items me aa sakta hai.
    // Order <-> Product asli me many-to-many hai; OrderItem beech ka table hai
    // aur extra data (quantity, price) bhi rakhta hai.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // SNAPSHOT: order ke time ki copy. Product ka naam/price baad me badle,
    // purana order wahi dikhana chahiye jo customer ne kharida tha.
    @Column(nullable = false, length = 150)
    private String productName;

    @Column(nullable = false, length = 50)
    private String sku;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal lineTotal;             // unitPrice x quantity
}