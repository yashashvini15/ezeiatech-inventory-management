package com.ezeiatech.inventory.repository;

import com.ezeiatech.inventory.entity.RestockRequest;
import com.ezeiatech.inventory.entity.RestockStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestockRequestRepository extends JpaRepository<RestockRequest, Long> {

    boolean existsByProductIdAndStatus(Long productId, RestockStatus status);

    List<RestockRequest> findByProductIdAndStatus(Long productId, RestockStatus status);

    @EntityGraph(attributePaths = {"product", "requestedBy"})
    Page<RestockRequest> findByStatus(RestockStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"product", "requestedBy"})
    Page<RestockRequest> findAll(Pageable pageable);
}