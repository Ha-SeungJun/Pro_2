package com.giproject.entity.payment;

import java.time.LocalDateTime;

import com.giproject.entity.order.OrderSheet;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Payment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long paymentNo;
	
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_sheet_no", nullable = false, unique = true) // 컬럼명 맞춤 수정
    private OrderSheet orderSheet;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false,length = 32)
	private PaymentStatus paymentStatus;
	
	private String paymentMethod;
	
	private LocalDateTime paidAt;
	
	@Column(unique = true)
	private String paymentId;
	private String currency;
	private String easyPayProvider;
	
	@PrePersist
	void onCreate() {
		if (paymentStatus == null) paymentStatus = PaymentStatus.PAID; // 기본값
	    if (paidAt == null) paidAt = LocalDateTime.now();
	}
}
