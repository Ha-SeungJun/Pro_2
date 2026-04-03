package com.giproject.entity.fees;

//기본 요금
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "fees_basic", uniqueConstraints = @UniqueConstraint(columnNames = { "weight" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeesBasic {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long tno;

	@Column(nullable = false, length = 50, unique = true)
	private String weight; // 예: 1톤, 2톤

	@Column(precision = 12, scale = 2)
	private BigDecimal ratePerKm; // 거리별 요금

	@Column(precision = 12, scale = 2)
	private BigDecimal initialCharge; // 기본요금

	private LocalDateTime updatedAt;// 수정일
	
	private String cargoImage;//
}