package com.giproject.dto.cargo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationStartResponseDTO {

    private String storeId;
    private String channelKey;
    private String identityVerificationId;
    private String redirectUrl;
}