package com.ezeiatech.inventory.repository;

import com.ezeiatech.inventory.entity.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
    List<OrderHistory> findByOrderIdOrderByCreatedAtAscIdAsc(Long orderId);
}
