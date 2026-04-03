package com.giproject.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyDataDTO {
    private String month;
    private long count;
}