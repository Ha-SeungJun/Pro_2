// src/main/java/com/giproject/controller/TokenAuthController.java
package com.giproject.controller;

import static com.giproject.security.jwt.JwtClaimKeys.EMAIL;
import static com.giproject.security.jwt.JwtClaimKeys.PROVIDER;
import static com.giproject.security.jwt.JwtClaimKeys.PROVIDER_ID;
import static com.giproject.security.jwt.JwtClaimKeys.ROLES;
import static com.giproject.security.jwt.JwtClaimKeys.UID;

import com.giproject.entity.account.UserIndex;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.entity.oauth.SocialAccount;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.oauth.SocialAccountRepo;
import com.giproject.security.JwtService;

import java.time.LocalDateTime;
import java.util.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class TokenAuthController {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;
    private final UserIndexRepository userIndexRepo;
    private final SocialAccountRepo socialAccountRepo;

    private final PasswordEncoder passwordEncoder;

    /* ----------------------------
     * 공통 에러 포맷
     * ---------------------------- */
    @Data @AllArgsConstructor
    static class ApiError {
        private String code;
        private String message;
    }

    /* ===== 0) 일반 로그인 ===== */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getLoginId(), req.getPassword())
            );

            String access  = jwtService.generateAccessToken(auth);
            String refresh = jwtService.generateRefreshToken(auth);

            return ResponseEntity.ok(Map.of(
                "accessToken", access,
                "refreshToken", refresh
            ));
        } catch (BadCredentialsException | UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("BAD_CREDENTIALS", "아이디 또는 비밀번호가 올바르지 않습니다."));
        } catch (LockedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("LOCKED", "잠긴 계정입니다. 관리자에게 문의하세요."));
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("DISABLED", "비활성화된 계정입니다. 관리자에게 문의하세요."));
        } catch (AccountExpiredException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("ACCOUNT_EXPIRED", "계정 사용기간이 만료되었습니다."));
        } catch (CredentialsExpiredException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("CREDENTIALS_EXPIRED", "비밀번호 사용기간이 만료되었습니다."));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("AUTH_FAILED", "로그인에 실패했습니다."));
        }
    }

    @Data
    static class LoginReq {
        private String loginId;
        private String password;
    }

    /* ===== 1) 소셜 첫가입 컨텍스트 ===== */
    @GetMapping("/social/signup-context")
    public ResponseEntity<?> signupContext(@RequestParam("ticket") String ticket) {
        if (ticket == null || ticket.isBlank()) {
            return ResponseEntity.status(404).body(new ApiError("TICKET_MISSING", "유효한 가입 티켓이 없습니다."));
        }
        try {
            Map<String, Object> claims = jwtService.parseTempToken(ticket);

            // ✅ 최소 목적 검증
            if (!"signup".equalsIgnoreCase(String.valueOf(claims.getOrDefault("purpose", "")))) {
                return ResponseEntity.status(404).body(new ApiError("TICKET_INVALID", "가입용 티켓이 아닙니다."));
            }

            String email    = (String) claims.get(EMAIL);
            String provider = (String) claims.get(PROVIDER);
            String name     = claims.get("name") instanceof String ? (String) claims.get("name") : null;

            if (email == null || email.isBlank()) {
                return ResponseEntity.status(404).body(new ApiError("EMAIL_REQUIRED", "이메일 동의가 필요합니다."));
            }
            return ResponseEntity.ok(new SignupContextDTO(email, provider, name));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(new ApiError("TICKET_EXPIRED", "가입 티켓이 만료되었거나 올바르지 않습니다."));
        }
    }

    @Data @AllArgsConstructor
    static class SignupContextDTO {
        private String email;
        private String provider;
        private String name; // 프리필용(없을 수 있음)
    }

    /* ===== 2) 소셜 첫가입 완료 ===== */
    @Transactional
    @PostMapping("/social/complete-signup")
    public ResponseEntity<?> completeSignup(@RequestBody CompleteSignupReq req) {

        // 2-0) 티켓 파싱
        if (req.getSignupTicket() == null || req.getSignupTicket().isBlank()) {
            return ResponseEntity.badRequest().body(new ApiError("NO_SIGNUP_TICKET", "가입 티켓이 없습니다."));
        }

        final Map<String, Object> stClaims;
        try {
            stClaims = jwtService.parseTempToken(req.getSignupTicket());
            if (!"signup".equalsIgnoreCase(String.valueOf(stClaims.getOrDefault("purpose", "")))) {
                return ResponseEntity.badRequest().body(new ApiError("TICKET_INVALID", "가입용 티켓이 아닙니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiError("SIGNUP_TICKET_EXPIRED", "가입 티켓이 만료되었거나 올바르지 않습니다."));
        }

        final String emailFromSocial = (String) stClaims.get(EMAIL);
        final String providerStr     = (String) stClaims.get(PROVIDER);     // ex) GOOGLE / KAKAO / NAVER (대문자 기대)
        final String providerId      = (String) stClaims.get(PROVIDER_ID);  // ex) sub 또는 id

        log.info("[complete-signup] claims EMAIL={}, PROVIDER={}, PROVIDER_ID={}, rawClaims={}",
                emailFromSocial, providerStr, providerId, stClaims);

        if (emailFromSocial == null || emailFromSocial.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiError("EMAIL_REQUIRED", "이메일이 필요합니다."));
        }
        if (providerStr == null || providerStr.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiError("PROVIDER_REQUIRED", "제공자 정보가 누락되었습니다."));
        }
        if (providerId == null || providerId.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiError("PROVIDER_ID_REQUIRED", "제공자 ID가 누락되었습니다."));
        }

        // 2-1) 입력값 검증
        if (req.getLoginId() == null || req.getLoginId().isBlank()) {
            return ResponseEntity.badRequest().body(new ApiError("LOGIN_ID_REQUIRED", "아이디가 필요합니다."));
        }
        if (req.getRole() == null || req.getRole().isBlank()) {
            return ResponseEntity.badRequest().body(new ApiError("ROLE_REQUIRED", "역할이 필요합니다."));
        }

        // ✅ 사전 중복 체크 (아이디/이메일)
        if (userIndexRepo.existsByLoginId(req.getLoginId())) {
            return ResponseEntity.badRequest().body(new ApiError("LOGIN_ID_TAKEN", "이미 사용 중인 아이디입니다."));
        }
        if (memberRepository.findByMemEmail(emailFromSocial).isPresent()
                || cargoOwnerRepository.findByCargoEmail(emailFromSocial).isPresent()) {
            return ResponseEntity.badRequest().body(new ApiError("EMAIL_TAKEN", "이미 사용 중인 이메일입니다."));
        }

        final UserIndex.Role domainRole;
        try {
            domainRole = UserIndex.Role.valueOf(req.getRole().toUpperCase()); // SHIPPER / DRIVER / ADMIN
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiError("INVALID_ROLE", "허용되지 않는 역할입니다."));
        }

        final LocalDateTime now = LocalDateTime.now();

        try {
            // 2-3) user_index 저장
            UserIndex ui = UserIndex.builder()
                    .loginId(req.getLoginId())
                    .email(emailFromSocial)
                    .provider(providerStr.toUpperCase())   // ✅ 저장 규칙 통일(대문자)
                    .providerId(providerId)
                    .role(domainRole)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            userIndexRepo.save(ui);

            // 2-4) 본 테이블 저장 (비밀번호 암호화)
            String encodedPw = passwordEncoder.encode(req.getPassword());

            switch (domainRole) {
                case SHIPPER -> {
                    Member m = Member.builder()
                            .memId(req.getLoginId())
                            .memPw(encodedPw)
                            .memEmail(emailFromSocial)
                            .memName(req.getName())
                            .memPhone(req.getPhone())
                            .memAddress(req.getAddress())
                            .memCreateIdDateTime(now)
                            .build();
                    memberRepository.save(m);
                }
                case DRIVER -> {
                    CargoOwner c = CargoOwner.builder()
                            .cargoId(req.getLoginId())
                            .cargoPw(encodedPw)
                            .cargoEmail(emailFromSocial)
                            .cargoName(req.getName())
                            .cargoPhone(req.getPhone())
                            .cargoAddress(req.getAddress())
                            .cargoCreatedDateTime(now)
                            .build();
                    cargoOwnerRepository.save(c);
                }
                case ADMIN -> {
                    Member m = Member.builder()
                            .memId(req.getLoginId())
                            .memPw(encodedPw)
                            .memEmail(emailFromSocial)
                            .memName(req.getName())
                            .memPhone(req.getPhone())
                            .memAddress(req.getAddress())
                            .memCreateIdDateTime(now)
                            .build();
                    memberRepository.save(m);
                }
            }

            // 2-5) social_account 업서트 (+ 반드시 FK 연결)
            SocialAccount.Provider providerEnum;
            try {
                providerEnum = SocialAccount.Provider.valueOf(providerStr.toUpperCase());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(new ApiError("UNSUPPORTED_PROVIDER", "지원하지 않는 소셜 제공자입니다."));
            }

            SocialAccount sa = socialAccountRepo
                    .findByProviderAndProviderUserId(providerEnum, providerId)
                    .orElseGet(() -> SocialAccount.builder()
                            .provider(providerEnum)
                            .providerUserId(providerId)
                            .build());

            sa.setUser(ui);                    // ✅ FK 연결이 핵심! (다음 로그인에서 바로 토큰 발급 경로)
            sa.setEmail(emailFromSocial);
            sa.setLoginId(req.getLoginId());   // 보조 필드 유지 시
            sa.setLinkedAt(now);
            sa.setSignupTicket(null);
            sa.setSignupTicketExpireAt(null);
            socialAccountRepo.save(sa);

            // 2-6) JWT 발급
            List<String> roles = new ArrayList<>();
            roles.add("ROLE_" + domainRole.name());
            roles.add(domainRole == UserIndex.Role.ADMIN ? "ROLE_ADMIN" : "ROLE_USER");

            Map<String, Object> loginClaims = new HashMap<>();
            loginClaims.put(EMAIL, emailFromSocial);
            loginClaims.put(UID, req.getLoginId());
            loginClaims.put(ROLES, new ArrayList<>(new LinkedHashSet<>(roles)));
            loginClaims.put(PROVIDER, providerEnum.name());
            loginClaims.put(PROVIDER_ID, providerId);

            String subject = req.getLoginId(); // 내부 로그인키
            String access  = jwtService.createAccessToken(loginClaims, subject);
            String refresh = jwtService.createRefreshToken(Map.of(UID, subject), subject);

            return ResponseEntity.ok(Map.of(
                "accessToken", access,
                "refreshToken", refresh
            ));

        } catch (DataIntegrityViolationException dive) {
            return ResponseEntity.status(409).body(new ApiError("CONFLICT", "이미 존재하는 정보입니다."));
        }
    }

    @Data
    static class CompleteSignupReq {
        private String signupTicket;
        private String role;      // SHIPPER / DRIVER / ADMIN
        private String loginId;
        private String password;
        private String name;
        private String email;     // (프런트 보낼 수 있으나 ticket 우선)
        private String phone;
        private String address;
    }

    /* ===== 3) 리프레시 → 액세스 재발급 ===== */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshReq req) {
        String refreshToken = req.getRefreshToken();
        if (refreshToken == null || refreshToken.isBlank() || !jwtService.validate(refreshToken)) {
            return ResponseEntity.status(401).body(new ApiError("INVALID_REFRESH", "리프레시 토큰이 유효하지 않습니다."));
        }

        String username = jwtService.getUsername(refreshToken);
        var userDetails = userDetailsService.loadUserByUsername(username);
        var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        String access = jwtService.generateAccessToken(authentication);

        return ResponseEntity.ok(Map.of("accessToken", access, "refreshToken", refreshToken));
    }

    @Data
    static class RefreshReq {
        private String refreshToken;
    }

    /* ===== 4) 로그아웃 ===== */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("ok", true));
    }

    /* ===== 5) 아이디 찾기 ===== */
    @GetMapping("/find-id")
    public ResponseEntity<?> findId(@RequestParam("email") String email) {
        var opt = memberRepository.findByMemEmail(email);
        if (opt.isPresent()) {
            return ResponseEntity.ok(Map.of("loginId", opt.get().getMemId()));
        }
        return ResponseEntity.status(404).body(new ApiError("NOT_FOUND", "일치하는 아이디가 없습니다."));
    }
}
