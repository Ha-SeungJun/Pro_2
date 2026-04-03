// src/main/java/com/giproject/dto/auth/SignupRequest.java
package com.giproject.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 일반/소셜 완료 공용 가입 요청 DTO */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    /** "SHIPPER"(화주) | "DRIVER"(차주) | 필요 시 "ADMIN" */
    @NotBlank(message = "role은 필수입니다.")
    private String role;

    /** 서비스 로그인 ID (memId/cargoId 공용) */
    @NotBlank(message = "loginId는 필수입니다.")
    @Size(min = 8, max = 15, message = "loginId는 8~15자여야 합니다.")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "loginId는 영문/숫자만 가능합니다.")
    private String loginId;

    @NotBlank(message = "password는 필수입니다.")
    @Size(min = 8, max = 20, message = "password는 8~20자여야 합니다.")
    private String password;

    @NotBlank(message = "name은 필수입니다.")
    private String name;

    @NotBlank(message = "email은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    private String phone;
    private String address;
}
