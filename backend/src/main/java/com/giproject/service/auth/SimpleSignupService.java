// src/main/java/com/giproject/service/auth/SimpleSignupService.java
package com.giproject.service.auth;

import static com.giproject.security.jwt.JwtClaimKeys.EMAIL;
import static com.giproject.security.jwt.JwtClaimKeys.PROVIDER;
import static com.giproject.security.jwt.JwtClaimKeys.PROVIDER_ID;
import static com.giproject.security.jwt.JwtClaimKeys.ROLES;
import static com.giproject.security.jwt.JwtClaimKeys.UID;

import com.giproject.dto.auth.SignupRequest;
import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.security.JwtService;

import java.time.LocalDateTime;
import java.util.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimpleSignupService {

    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;
    private final UserIndexRepository userIndexRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /** ID 중복 확인용 */
    @Transactional(readOnly = true)
    public boolean existsByLoginId(String loginId) {
        return userIndexRepo.existsByLoginId(loginId);
    }

    /** 일반/소셜-완료 공용 가입 */
    @Transactional
    public MemberDTO signup(SignupRequest req) {
        // 1) 입력 정규화 + 검증
        final String loginId = safeTrim(req.getLoginId());
        final String emailRaw = safeTrim(req.getEmail());
        final String email = normalizeEmail(emailRaw);
        final String rawPw = req.getPassword();
        final String roleStr = safeTrim(req.getRole());

        if (isBlank(loginId)) throw new IllegalArgumentException("LOGIN_ID_REQUIRED");
        if (isBlank(rawPw))   throw new IllegalArgumentException("PASSWORD_REQUIRED");
        if (isBlank(email))   throw new IllegalArgumentException("EMAIL_REQUIRED");
        if (isBlank(roleStr)) throw new IllegalArgumentException("ROLE_REQUIRED");

        final UserIndex.Role domainRole;
        try {
            domainRole = UserIndex.Role.valueOf(roleStr.toUpperCase()); // SHIPPER / DRIVER / ADMIN
        } catch (Exception e) {
            throw new IllegalArgumentException("INVALID_ROLE");
        }

        // 2) 전역 중복 차단
        if (userIndexRepo.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("LOGIN_ID_TAKEN");
        }
        if (userIndexRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("EMAIL_TAKEN");
        }

        // 3) user_index 저장
        final LocalDateTime now = LocalDateTime.now();
        UserIndex ui = UserIndex.builder()
                .loginId(loginId)
                .email(email)           // NOT NULL & UNIQUE
                .provider("LOCAL")      // 소셜이 아닌 일반 가입 구분값
                .providerId(loginId)    // 로컬은 loginId를 providerId처럼 사용
                .role(domainRole)
                .createdAt(now)
                .updatedAt(now)
                .build();
        userIndexRepo.save(ui);

        // 4) 본 테이블 저장 (비밀번호 암호화)
        final String enc = passwordEncoder.encode(rawPw);
        final String name = req.getName();
        final String phone = req.getPhone();
        final String address = req.getAddress();

        switch (domainRole) {
            case SHIPPER -> {
                Member m = new Member();
                m.setMemId(loginId);
                m.setMemPw(enc);
                m.setMemEmail(email);
                m.setMemName(name);
                m.setMemPhone(phone);
                m.setMemAddress(address);
                m.setMemCreateIdDateTime(LocalDateTime.now());
                memberRepository.save(m);
            }
            case DRIVER -> {
                CargoOwner c = new CargoOwner();
                c.setCargoId(loginId);
                c.setCargoPw(enc);
                c.setCargoEmail(email);
                c.setCargoName(name);
                c.setCargoPhone(phone);
                c.setCargoAddress(address);
                c.setCargoCreatedDateTime(LocalDateTime.now());
                cargoOwnerRepository.save(c);
            }
            case ADMIN -> {
                Member m = new Member();
                m.setMemId(loginId);
                m.setMemPw(enc);
                m.setMemEmail(email);
                m.setMemName(name);
                m.setMemPhone(phone);
                m.setMemAddress(address);
                m.setMemCreateIdDateTime(LocalDateTime.now());
                memberRepository.save(m);
            }
        }

        // 5) 토큰 발급 (도메인 권한 + 전역 권한 보정)
        List<String> roles = new ArrayList<>();
        roles.add("ROLE_" + domainRole.name());
        if (domainRole == UserIndex.Role.ADMIN) roles.add("ROLE_ADMIN");
        else roles.add("ROLE_USER");

        Map<String, Object> claims = new HashMap<>();
        claims.put(EMAIL, email);
        claims.put(UID, loginId);
        claims.put(ROLES, roles);
        claims.put(PROVIDER, "LOCAL");
        claims.put(PROVIDER_ID, loginId);

        String access  = jwtService.createAccessToken(claims, loginId);
        String refresh = jwtService.createRefreshToken(Map.of(UID, loginId), loginId);

        // 6) 반환 DTO — 정적 팩토리로 생성 (User.builder 충돌 없음)
        return MemberDTO.of(
                loginId,
                email,
                name,
                phone,
                address,
                LocalDateTime.now(), // 또는 엔티티의 생성시각 사용 가능
                roles,
                access,
                refresh
        );
    }

    private static String safeTrim(String s) {
        return s == null ? null : s.trim();
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    /** 이메일 정규화(트림 + 소문자). 필요시 Gmail 규칙('+', '.') 처리 추가 가능 */
    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
