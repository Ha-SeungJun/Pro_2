package com.giproject.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter
public class LoginRequest {
    @NotBlank
    private String loginId;   // memId or cargoId
    @NotBlank
    private String password;
}