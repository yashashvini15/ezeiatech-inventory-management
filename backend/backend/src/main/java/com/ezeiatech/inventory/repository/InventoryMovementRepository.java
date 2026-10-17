package com.ezeiatech.inventory.repository;

import com.ezeiatech.inventory.entity.InventoryMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface InventoryMovementRepository
        extends JpaRepository<InventoryMovement, Long>, JpaSpecificationExecutor<InventoryMovement> {

    @Override
    @EntityGraph(attributePaths = {"product", "createdBy"})
    Page<InventoryMovement> findAll(Specification<InventoryMovement> spec, Pageable pageable);
}