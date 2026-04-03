package com.giproject.entity.estimate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "Estimate")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Estimate {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long eno;
	
	private String startAddress;
	private String endAddress;
	private double distanceKm;
	private String cargoWeight;
	private String cargoType;
	private LocalDateTime  startTime;
	private int totalCost;
	private int baseCost;
	private int distanceCost;
	private int specialOption;
	
	@Column(nullable = false)//true 시 주문서 작성완료
	private boolean isOrdered;
	
	
	@Column(nullable = false) //true 시 매칭완료
	private boolean matched;
	
	@Column(nullable = false)
	private boolean isTemp;//true 면 임시저장
	
	@ManyToOne
	@JoinColumn(name = "mem_id")
	private Member member;
	
	public void changeStartAddress(String startAddress) {
		this.startAddress = startAddress;
	}
	public void changeEndAddress(String endAddress) {
		this.endAddress = endAddress;
	}
	public void changeCargoWeight(String cargoWeight) {
		this.cargoWeight = cargoWeight;
	}
	public void changeCargoType(String cargoType) {
		this.cargoType = cargoType;
	}
	
	public void changeStartTime(LocalDateTime  startTime) {
		this.startTime = startTime;
	}
	public void changeTotalCost(int totalCost) {
		this.totalCost = totalCost;
	}
	public void changeMatched(boolean matched) {
		this.matched = matched;
	}
	public void changeIsTemp(boolean isTemp) {
		this.isTemp = isTemp;
	}
	public void changeIsOrdered(boolean isOrdered) {
		this.isOrdered = isOrdered;
	}
	@OneToMany(mappedBy = "estimate", fetch = FetchType.LAZY)
    private List<Matching> matchings = new ArrayList<>();
}
