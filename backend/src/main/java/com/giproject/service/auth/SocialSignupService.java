// src/main/java/com/giproject/service/auth/SocialSignupService.java
package com.giproject.service.auth;

import com.giproject.dto.auth.SocialSignupCompleteRequest;
import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.account.UserIndex.Role;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.entity.oauth.SocialAccount;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.oauth.SocialAccountRepo;

import lombok.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SocialSignupService {

    private final SocialAccountRepo socialAccountRepo;
    private final UserIndexRepository userIndexRepo;
    private final MemberRepository memberRepo;
    private final CargoOwnerRepository cargoRepo;
    private final PasswordEncoder encoder;

    /** 소셜 첫가입 완료 */
    @Transactional
    public UserDetails completeSignup(SocialSignupCommand cmd) {
        // 1) 티켓 검증
        SocialAccount acc = socialAccountRepo.findBySignupTicket(cmd.getTicket())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 티켓"));
        if (acc.getSignupTicketExpireAt() == null || acc.getSignupTicketExpireAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("티켓 만료");
        }
        if (acc.getLoginId() != null) {
            throw new IllegalStateException("이미 연결된 소셜 계정");
        }

        // 2) 전역 유니크 검증 (loginId / email)
        String loginId = cmd.getLoginId();
        if (userIndexRepo.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("이미 사용 중인 ID");
        }

        // 이메일은 요청값 우선, 없으면 소셜계정의 이메일 사용
        String email = (cmd.getEmail() != null && !cmd.getEmail().isBlank())
                ? cmd.getEmail()
                : acc.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일이 필요합니다.");
        }
        if (userIndexRepo.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 3) user_index insert
        String provider   = acc.getProvider() == null ? null : acc.getProvider().name(); // GOOGLE/KAKAO/NAVER
        String providerId = acc.getProviderUserId();

        Role role = Role.valueOf(cmd.getRole()); // "SHIPPER" or "DRIVER" or "ADMIN"
        userIndexRepo.save(UserIndex.builder()
                .loginId(loginId)
                .role(role)
                .email(email)
                .provider(provider)
                .providerId(providerId)
                .build());

        // 4) 역할별 본 테이블 insert
        switch (role) {
            case SHIPPER, ADMIN -> {
                Member m = Member.builder()
                        .memId(loginId)
                        .memPw(encoder.encode(cmd.getPassword()))
                        .memEmail(email)
                        .memName(cmd.getName())
                        .memPhone(cmd.getPhone())
                        .memAddress(cmd.getAddress())
                        .memCreateIdDateTime(LocalDateTime.now())
                        .build();
                memberRepo.save(m);
            }
            case DRIVER -> {
                CargoOwner c = CargoOwner.builder()
                        .cargoId(loginId)
                        .cargoPw(encoder.encode(cmd.getPassword()))
                        .cargoEmail(email)
                        .cargoName(cmd.getName())
                        .cargoPhone(cmd.getPhone())
                        .cargoAddress(cmd.getAddress())
                        .cargoCreatedDateTime(LocalDateTime.now())
                        .build();
                cargoRepo.save(c);
            }
        }

        // 5) 소셜 계정 ↔ 서비스 ID 연결
        acc.setLoginId(loginId);
        acc.setLinkedAt(LocalDateTime.now());
        acc.setSignupTicket(null);
        acc.setSignupTicketExpireAt(null);
        socialAccountRepo.save(acc);

        // 6) 최종 UserDetails 구성 (역할별 DTO 원형 유지)
        if (role == Role.DRIVER) {
            CargoOwner saved = cargoRepo.findByCargoId(loginId)
                    .orElseThrow(() -> new IllegalStateException("가입 직후 CargoOwner 조회 실패"));
            return CargoOwnerDTO.fromCargoOwner(saved); // 내부에서 roles 자동 추론
        } else {
            Member saved = memberRepo.findByMemId(loginId)
                    .orElseThrow(() -> new IllegalStateException("가입 직후 Member 조회 실패"));
            return MemberDTO.fromMember(saved); // 내부에서 roles 자동 추론
        }
    }

    /** 컨트롤러 DTO → 커맨드 변환 헬퍼 */
    public static SocialSignupCommand fromRequest(SocialSignupCompleteRequest req) {
        return SocialSignupCommand.builder()
                .ticket(req.getSignupTicket())
                .role(req.getRole())
                .loginId(req.getLoginId())
                .password(req.getPassword())
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .build();
    }

    // ===== Command 객체 (기본 생성자 포함) =====
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SocialSignupCommand {
        private String ticket;
        private String role;     // "SHIPPER" or "DRIVER" or "ADMIN"
        private String loginId;
        private String password;
        private String name;
        private String email;
        private String phone;
        private String address;
    }
}
