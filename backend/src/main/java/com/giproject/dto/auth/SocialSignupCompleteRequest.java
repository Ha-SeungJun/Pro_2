// src/main/java/com/giproject/dto/auth/SocialSignupCompleteRequest.java
package com.giproject.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SocialSignupCompleteRequest {

    /** 소셜 시작 단계에서 발급한 1회성 티켓 */
    @NotBlank
    @JsonAlias({"signupTicket", "signup_token"}) // 이 키들로 와도 ticket에 매핑
    private String ticket;

    /** 사용자가 고른 서비스 ID(=memId or cargoId) */
    @NotBlank
    @Size(min = 8, max = 15)
    @Pattern(regexp = "^[A-Za-z0-9]+$")
    private String loginId;

    /** 로그인 비밀번호 */
    @NotBlank
    @Size(min = 8, max = 20)
    private String password;

    @NotBlank
    private String name;

    @Email @NotBlank
    private String email;

    private String phone;
    private String address;

    /** "SHIPPER" or "DRIVER" */
    @NotBlank
    private String role;

    /* ===== 별칭 접근자: 기존 코드에서 getSignupTicket()/setSignupTicket() 써도 동작 ===== */
    public String getSignupTicket() {
        return ticket;
    }
    public void setSignupTicket(String signupTicket) {
        this.ticket = signupTicket;
    }
}
