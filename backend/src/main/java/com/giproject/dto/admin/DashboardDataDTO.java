package com.giproject.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardDataDTO {
    private long totalUsers;
    private long monthlyRevenue;
    private long newMembers;
    private long totalDeliveries;
    private List<MonthlyDataDTO> monthlyDeliveries;
    private List<MonthlyDataDTO> newMembersByMonth;
    private List<String> currentDeliveries;
    private List<String> pastDeliveries;
}