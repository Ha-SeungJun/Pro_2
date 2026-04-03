package com.giproject.entity.delivery;

import java.time.LocalDateTime;

import com.giproject.entity.payment.Payment;
import com.giproject.entity.cargo.CargoOwner; // Added import

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Delivery {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long deliveryNo;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	@Builder.Default
	private DeliveryStatus status = DeliveryStatus.PENDING;
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "payment_no")
	private Payment payment;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cargo_owner_id", referencedColumnName = "cargo_id")
	private CargoOwner cargoOwner;
	
	private LocalDateTime completTime;

	  public void markInTransit() {
	        this.status = DeliveryStatus.IN_TRANSIT;
	    }

	    public void markCompleted() {
	        this.status = DeliveryStatus.COMPLETED;
	        this.completTime = LocalDateTime.now();
	    }
}
