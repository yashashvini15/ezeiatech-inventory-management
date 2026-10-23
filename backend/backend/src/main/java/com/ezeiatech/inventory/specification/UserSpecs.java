package com.ezeiatech.inventory.specification;

import com.ezeiatech.inventory.entity.Role;
import com.ezeiatech.inventory.entity.User;
import com.ezeiatech.inventory.entity.UserStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecs {
    private UserSpecs() {}

    // Sirf CUSTOMER role. Admin/Staff kabhi list me nahi aate.
    public static Specification<User> customers(String search, UserStatus status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("role"), Role.CUSTOMER));

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + escapeLike(search.trim().toLowerCase()) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, '\\'),
                        cb.like(cb.lower(root.get("email")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // user ke "%" / "_" ko normal character maano (wildcard na bane)
    private static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}