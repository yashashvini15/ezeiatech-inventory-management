package com.ezeiatech.inventory.specification;

import com.ezeiatech.inventory.entity.Order;
import com.ezeiatech.inventory.entity.OrderStatus;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

public class OrderSpecs {
    private OrderSpecs() {}

    public static Specification<Order> filter(Long customerId, OrderStatus status, String search,
                                              LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            // customer ek hi query me join (count query me fetch nahi lagta)
            if (query != null && !Long.class.equals(query.getResultType()) && !long.class.equals(query.getResultType())) {
                root.fetch("customer", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + escapeLike(search.trim().toLowerCase()) + "%";
                predicates.add(cb.like(cb.lower(root.get("orderNumber")), pattern, '\\'));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"),
                        from.atStartOfDay().toInstant(ZoneOffset.UTC)));
            }
            if (to != null) {
                predicates.add(cb.lessThan(root.get("createdAt"),
                        to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}