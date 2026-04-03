package com.giproject.entity.fees;

//추가 요금
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "fees_extra", uniqueConstraints = @UniqueConstraint(columnNames = { "extra_charge_title" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeesExtra {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long exno;

	@Column(name = "extra_charge_title", nullable = false, length = 50, unique = true)
	private String extraChargeTitle; // 타입

	@Column(precision = 12, scale = 2)
	private BigDecimal extraCharge;// 추가금액

	private LocalDateTime updatedAt;// 수정일
}