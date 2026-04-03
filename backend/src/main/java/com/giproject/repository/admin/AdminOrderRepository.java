package com.giproject.repository.admin;

import com.giproject.dto.admin.MonthlyDataDTO;
import com.giproject.entity.order.OrderSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AdminOrderRepository extends JpaRepository<OrderSheet, Long> {

    // 월별 주문 건수 조회
    @Query(value ="SELECT DATE_FORMAT(o.order_time, '%Y-%m') as month, COUNT(*) as count FROM order_sheet o GROUP BY month ORDER BY month", nativeQuery = true)
    List<Object[]> findMonthlyDeliveryCounts();
    // 진행 중인 배송건


    // 완료된 배송건

}