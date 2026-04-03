package com.giproject.entity.order;

import java.time.LocalDateTime;

import com.giproject.entity.matching.Matching;
import com.giproject.entity.payment.Payment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "OrderSheet")
@Getter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class OrderSheet {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long orderNo;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "matching_no", nullable = false) // 스키마와 일치
	private Matching matching;

	@OneToOne(mappedBy = "orderSheet", fetch = FetchType.LAZY)
	private Payment payment; // 역참조 추가

	@Column(nullable = false, unique = true)
	private String orderUuid;
	private String startRestAddress;
	private String endRestAddress;
	private LocalDateTime orderTime;
	private String Addressee;
	private String phone;
	private String AddresseeEmail;
}
