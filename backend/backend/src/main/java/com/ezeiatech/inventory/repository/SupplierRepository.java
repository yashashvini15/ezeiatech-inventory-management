package com.ezeiatech.inventory.repository;

import com.ezeiatech.inventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier,Long> {
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email,Long id);
}
