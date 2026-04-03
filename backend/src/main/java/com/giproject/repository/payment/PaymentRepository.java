package com.giproject.repository.payment;

import com.giproject.entity.payment.PaymentStatus;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.payment.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long>{

	@EntityGraph(attributePaths = {
	          "orderSheet",
	          "orderSheet.matching",
	          "orderSheet.matching.cargoOwner",
	          "orderSheet.matching.estimate"
	      })
	      Optional<Payment> findByPaymentNo(Long id);

    List<Payment> findAllByPaymentStatus(PaymentStatus status);
    
    Optional<Payment> findById(Long id);
    Optional<Payment> findByOrderSheet_Matching_MatchingNo(Long matchingNo);
}
