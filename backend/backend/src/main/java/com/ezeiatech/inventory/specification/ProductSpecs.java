package com.ezeiatech.inventory.specification;

import com.ezeiatech.inventory.entity.Product;
import com.ezeiatech.inventory.entity.ProductStatus;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecs {
    private ProductSpecs(){}

    public static Specification<Product> filter(String search, Long categoryId, ProductStatus status,
                                                BigDecimal minPrice, BigDecimal maxPrice, Boolean lowStock){
        return (root, query, cb) -> {

            if(query != null && !Long.class.equals(query.getResultType()) && !long.class.equals(query.getResultType())){
                root.fetch("category", JoinType.LEFT);
                root.fetch("supplier", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            if(search != null && !search.isBlank()){
                String pattern = "%" + escapeLike(search.trim().toLowerCase()) + "%";

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, '\\'),
                        cb.like(cb.lower(root.get("sku")), pattern, '\\')
                ));
            }

            if (categoryId != null){
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if(status != null){
                predicates.add(cb.equal(root.get("status"), status));
            }
            if(minPrice != null){
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if(maxPrice != null){
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if(Boolean.TRUE.equals(lowStock)){
                predicates.add(cb.lessThanOrEqualTo(root.get("stock"), root.get("reorderLevel")));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        }
    private static String escapeLike(String s){
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
