package com.ezeiatech.inventory.repository;

import com.ezeiatech.inventory.entity.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {

    @Query("select h from OrderHistory h join fetch h.changedBy " +
            "where h.order.id = :orderId order by h.createdAt asc, h.id asc")
    List<OrderHistory> findByOrderId(@Param("orderId") Long orderId);
}