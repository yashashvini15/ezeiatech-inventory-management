package com.ezeiatech.inventory.repository;

import com.ezeiatech.inventory.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    @Query("select p from Product p where p.stock <= p.reorderLevel and p.status = ProductStatus.ACTIVE")
    Page<Product> findLowStock(Pageable pageable);

    // dashboard card: findLowStock jaisi hi condition, sirf count
    @Query("select count(p) from Product p where p.stock <= p.reorderLevel and p.status = ProductStatus.ACTIVE")
    long countLowStock();
}
