package com.giproject.repository.admin;

import com.giproject.dto.admin.MonthlyDataDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.entity.order.OrderSheet;
import com.giproject.entity.payment.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@NoRepositoryBean
public interface AdminDashboardRepository extends JpaRepository<Object, Long> {

    // 총 회원 수
    @Query("SELECT (SELECT COUNT(m) FROM Member m) + (SELECT COUNT(c) FROM CargoOwner c) FROM DUAL")
    long countAllUsers();

    // 월별 총 매출
    @Query("SELECT SUM(p.orderSheet.matching.estimate.totalCost) " +
           "FROM Payment p " +
           "WHERE FUNCTION('YEAR', p.paidAt) = FUNCTION('YEAR', :date) " +
           "AND FUNCTION('MONTH', p.paidAt) = FUNCTION('MONTH', :date) " +
           "AND p.paymentStatus = 'PAID'")
    Optional<Long> findTotalMonthlyRevenue(@Param("date") LocalDate date);

    // 총 주문 건수
    long countOrders();

    // 신규 Member 수11
    @Query("SELECT COUNT(m) FROM Member m WHERE FUNCTION('YEAR', m.memCreateIdDateTime) = FUNCTION('YEAR', :date) AND FUNCTION('MONTH', m.memCreateIdDateTime) = FUNCTION('MONTH', :date)")
    long countNewMembersByDate(@Param("date") LocalDate date);
    
    // 신규 CargoOwner 수22
    @Query("SELECT COUNT(c) FROM CargoOwner c WHERE FUNCTION('YEAR', c.cargoCreatedDateTime) = FUNCTION('YEAR', :date) AND FUNCTION('MONTH', c.cargoCreatedDateTime) = FUNCTION('MONTH', :date)")
    long countNewCargoOwnersByDate(@Param("date") LocalDate date);

    // 월별 주문 건수
    @Query(value = "SELECT DATE_FORMAT(o.order_time, '%Y-%m') as month, COUNT(*) as count FROM OrderSheet o GROUP BY month ORDER BY month", nativeQuery = true)
    List<MonthlyDataDTO> findMonthlyDeliveryCounts();

    // 월별 Member 수11
    @Query(value = "SELECT DATE_FORMAT(m.mem_create_id_date_time, '%Y-%m') as month, COUNT(*) as count FROM member m GROUP BY month ORDER BY month", nativeQuery = true)
    List<MonthlyDataDTO> findMonthlyNewMemberCounts();
    
    // 월별 신규 회원 (CargoOwner) 수22
    @Query(value = "SELECT DATE_FORMAT(c.cargo_created_date_time, '%Y-%m') as month, COUNT(*) as count FROM cargo_owner c GROUP BY month ORDER BY month", nativeQuery = true)
    List<MonthlyDataDTO> findMonthlyNewCargoOwnerCounts();

    // 진행 중인 배송 (최신 5건)33
    @Query("SELECT o FROM OrderSheet o WHERE o.isCompleted = FALSE ORDER BY o.orderTime DESC")
    List<OrderSheet> findTop5CurrentDeliveries();
    
    // 지난 배송 내역 (최신 8건)33
    @Query("SELECT o FROM OrderSheet o WHERE o.isCompleted = TRUE ORDER BY o.orderTime DESC")
    List<OrderSheet> findTop8PastDeliveries();
}