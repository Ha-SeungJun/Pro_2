package com.giproject.dto.admin;

import com.giproject.entity.account.SuspendPeriod;
import lombok.*;

import java.time.LocalDateTime;

public class UserSuspendDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SuspendRequest {
        private SuspendPeriod period;   // WEEK, MONTH, YEAR, PERMANENT
        private String reason;          // 정지 사유
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SuspendResponse {
        private String loginId;
        private Boolean suspended;
        private LocalDateTime suspendStartAt;
        private LocalDateTime suspendEndAt;
        private String suspendReason;
        private String message;
    }
}