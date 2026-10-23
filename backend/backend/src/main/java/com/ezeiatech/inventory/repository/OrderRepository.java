package com.ezeiatech.inventory.repository;

import com.ezeiatech.inventory.entity.Order;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.ezeiatech.inventory.entity.OrderStatus;
import com.ezeiatech.inventory.repository.projection.ReportViews.PeriodSalesView;
import com.ezeiatech.inventory.repository.projection.ReportViews.StatusCountView;
import com.ezeiatech.inventory.repository.projection.ReportViews.TopProductView;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    // status badalte/cancel karte waqt order row lock: do cancel ek saath aaye to stock 2 baar wapas na ho
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    // ek query me har status ka count (total/pending/delivered isi se nikalte hain)
    @Query("select o.status as status, count(o) as cnt from Order o group by o.status")
    List<StatusCountView> countGroupedByStatus();

    // excluded (CANCELLED) ko chhodke total sale. Koi order nahi ho to null aata hai
    @Query("select sum(o.total) from Order o where o.status <> :excluded")
    BigDecimal sumTotalExcluding(@Param("excluded") OrderStatus excluded);

    // top selling: product join + group by. Pageable sirf LIMIT ke liye (top 5)
    @Query("""
        select p.id as productId, p.name as name,
               sum(oi.quantity) as quantity, sum(oi.lineTotal) as revenue
        from OrderItem oi join oi.product p join oi.order o
        where o.status <> :excluded
        group by p.id, p.name
        order by sum(oi.quantity) desc, p.id asc
        """)
    List<TopProductView> findTopProducts(@Param("excluded") OrderStatus excluded, Pageable pageable);

    // Native (PostgreSQL): month/day bucket timezone ke hisaab se. "group by 1" = select ke pehle column par group
    @Query(value = """
        select to_char(o.created_at at time zone :zone, 'YYYY-MM') as period,
               count(*) as cnt, sum(o.total) as sales
        from orders o
        where o.status <> :excluded and o.created_at >= :since
        group by 1 order by 1
        """, nativeQuery = true)
    List<PeriodSalesView> salesByMonth(@Param("zone") String zone,
                                       @Param("excluded") String excluded,
                                       @Param("since") Instant since);

    @Query(value = """
        select to_char(o.created_at at time zone :zone, 'YYYY-MM-DD') as period,
               count(*) as cnt, sum(o.total) as sales
        from orders o
        where o.status <> :excluded and o.created_at >= :since and o.created_at < :until
        group by 1 order by 1
        """, nativeQuery = true)
    List<PeriodSalesView> salesByDay(@Param("zone") String zone,
                                     @Param("excluded") String excluded,
                                     @Param("since") Instant since,
                                     @Param("until") Instant until);
}