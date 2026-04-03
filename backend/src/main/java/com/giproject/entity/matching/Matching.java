package com.giproject.entity.matching;

import java.time.LocalDateTime;

import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.order.OrderSheet;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "Matching")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Matching {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long matchingNo;
	
	@ManyToOne
	@JoinColumn(name="eno")
	private Estimate estimate;
	
	@ManyToOne
	@JoinColumn(name = "cargo_id",columnDefinition="varchar(50)")
	private CargoOwner cargoOwner;
	private boolean isAccepted;
	private LocalDateTime acceptedTime;
	
	public void changeIsAccepted (boolean isAccepted) {
		this.isAccepted = isAccepted;
	}
	
	public void changeAcceptedTime(LocalDateTime acceptedTime) {
		this.acceptedTime = acceptedTime;
	}
	public void changeCargoOwner(CargoOwner cargoOwner) {
		this.cargoOwner = cargoOwner;
	}
	
	@OneToOne(mappedBy = "matching", fetch = FetchType.LAZY)
	private OrderSheet orderSheet; 
}