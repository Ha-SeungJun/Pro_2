package com.giproject.dto.cargo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationStatusDTO {

    private Boolean isVerified;
    private LocalDateTime verifiedAt;
    private String verifiedPhone;
}