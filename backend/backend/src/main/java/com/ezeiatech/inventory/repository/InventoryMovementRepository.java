package com.ezeiatech.inventory.repository;

import com.ezeiatech.inventory.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement,Long>,
        JpaSpecificationExecutor<InventoryMovement> {

}
