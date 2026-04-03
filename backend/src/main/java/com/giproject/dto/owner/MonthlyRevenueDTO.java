package com.giproject.dto.owner;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyRevenueDTO {
    private Integer year;   // 2025
    private Integer month;  // 8
    private Long revenue;   // 월 합계 (원)
}
