// src/main/java/com/giproject/controller/AuthController.java
package com.giproject.controller;

import com.giproject.dto.auth.SignupRequest;
import com.giproject.dto.member.MemberDTO;
import com.giproject.security.JwtService;
import com.giproject.service.auth.SimpleSignupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@Log4j2
public class AuthController {

    private final SimpleSignupService signupService;
    private final JwtService jwtService;

    /** 일반 회원가입 */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req, BindingResult br) {
        if (br.hasErrors()) {
            var errors = br.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .toList();
            log.warn("Signup validation errors: {}", errors);
            return ResponseEntity.badRequest().body(errors);
        }
        try {
            MemberDTO result = signupService.signup(req);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            log.warn("Signup failed (bad request): {}", ex.getMessage());
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            log.error("Signup failed (server error)", ex);
            return ResponseEntity.internalServerError().body("회원가입 중 오류가 발생했습니다.");
        }
    }

    /** ID 중복 확인 */
    @GetMapping("/check-id")
    public ResponseEntity<?> checkId(@RequestParam("loginId") String loginId) {
        try {
            boolean exists = signupService.existsByLoginId(loginId);
            return ResponseEntity.ok(Map.of("available", !exists));
        } catch (Exception e) {
            log.error("check-id failed for {}: {}", loginId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "CHECK_ID_FAILED",
                "message", e.getClass().getSimpleName() + ": " + (e.getMessage() == null ? "" : e.getMessage())
            ));
        }
    }

    /** 소셜 첫 로그인 후: 프리필 이메일/프로바이더 조회 */
    @GetMapping("/signup-context")
    public ResponseEntity<?> signupContext(
            @CookieValue(value = "signup_token", required = false) String cookieToken,
            @RequestHeader(value = "Authorization", required = false) String auth
    ) {
        String token = extractToken(cookieToken, auth);
        if (token == null) return ResponseEntity.status(401).body(Map.of("error", "NO_TOKEN"));
        try {
            var claims = jwtService.parseSignupToken(token);
            String email = (String) claims.get("email");
            String provider = Optional.ofNullable((String) claims.get("provider")).orElse("social");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "NO_EMAIL_IN_TOKEN"));
            }
            return ResponseEntity.ok(Map.of("email", email, "provider", provider));
        } catch (Exception ex) {
            log.error("signup-context parse failed", ex);
            return ResponseEntity.status(401).body(Map.of("error", "INVALID_TOKEN"));
        }
    }

    /** 소셜 첫 가입 완료: 토큰의 이메일만 신뢰하여 가입 */
    @PostMapping("/complete-signup")
    public ResponseEntity<?> completeSignup(
            @CookieValue(value = "signup_token", required = false) String cookieToken,
            @RequestHeader(value = "Authorization", required = false) String auth,
            @Valid @RequestBody SignupRequest req,
            BindingResult br
    ) {
        if (br.hasErrors()) {
            var errors = br.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .toList();
            return ResponseEntity.badRequest().body(errors);
        }

        String token = extractToken(cookieToken, auth);
        if (token == null) return ResponseEntity.status(401).body(Map.of("error", "NO_TOKEN"));

        try {
            var claims = jwtService.parseSignupToken(token);
            String email = (String) claims.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "NO_EMAIL_IN_TOKEN"));
            }

            // 프론트 이메일 무시 → 토큰 이메일 사용
            SignupRequest safeReq = new SignupRequest(
                    req.getRole(),
                    req.getLoginId(),
                    req.getPassword(),
                    req.getName(),
                    email,
                    req.getPhone(),
                    req.getAddress()
            );

            MemberDTO result = signupService.signup(safeReq);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            log.error("Complete-signup failed", ex);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "SERVER_ERROR",
                    "message", Optional.ofNullable(ex.getMessage()).orElse("")
            ));
        }
    }

    /** 쿠키 우선, 없으면 Authorization: Bearer */
    private String extractToken(String cookieToken, String authHeader) {
        if (cookieToken != null && !cookieToken.isBlank()) return cookieToken;
        if (authHeader != null && authHeader.startsWith("Bearer ")) return authHeader.substring(7);
        return null;
    }
}
