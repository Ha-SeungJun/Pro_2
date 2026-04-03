package com.giproject.repository.admin;

import com.giproject.entity.payment.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Optional;

public interface AdminPaymentRepository extends JpaRepository<Payment, Long> {

    // 이번 달 총 매출 계산
    @Query("SELECT SUM(p.orderSheet.matching.estimate.totalCost) " +
           "FROM Payment p " +
           "WHERE FUNCTION('YEAR', p.paidAt) = FUNCTION('YEAR', :date) " +
           "AND FUNCTION('MONTH', p.paidAt) = FUNCTION('MONTH', :date) " +
           "AND p.paymentStatus = 'PAID'")
    Optional<Long> findTotalMonthlyRevenue(@Param("date") LocalDate date);
}
