package com.giproject.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponse {
    private String tokenType;     // "Bearer"
    private String accessToken;
    private String refreshToken;
    private long   expiresIn;     // accessToken 만료(초)
}
