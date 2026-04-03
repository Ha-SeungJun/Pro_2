// com.giproject.service.auth
package com.giproject.service.auth;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.giproject.dto.auth.SocialLoginResult;
import com.giproject.dto.auth.SocialSignupCompleteRequest;
import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.account.UserIndex.Role;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.entity.oauth.SocialAccount;
import com.giproject.entity.oauth.SocialAccount.Provider;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.oauth.SocialAccountRepo;

@Service
@RequiredArgsConstructor
public class SocialAuthService {

    private final SocialAccountRepo socialAccountRepo;
    private final UserIndexRepository userIndexRepo;
    private final MemberRepository memberRepo;
    private final CargoOwnerRepository cargoRepo;
    private final PasswordEncoder encoder;

    // ========= 1) 소셜 로그인 시작 =========
    @Transactional
    public SocialLoginResult startKakao(String kakaoUserId, String emailMaybe) {
        return startSocial(Provider.KAKAO, kakaoUserId, emailMaybe);
    }

    @Transactional
    public SocialLoginResult startNaver(String naverUserId, String emailMaybe) {
        return startSocial(Provider.NAVER, naverUserId, emailMaybe);
    }

    @Transactional
    public SocialLoginResult startGoogle(String googleSub, String emailMaybe) {
        return startSocial(Provider.GOOGLE, googleSub, emailMaybe);
    }

    private SocialLoginResult startSocial(Provider provider, String providerUserId, String emailMaybe) {
        var acc = socialAccountRepo.findByProviderAndProviderUserId(provider, providerUserId)
            .orElseGet(() -> socialAccountRepo.save(
                SocialAccount.builder()
                    .provider(provider)
                    .providerUserId(providerUserId)
                    .email(emailMaybe)
                    .build()
            ));

        if (acc.getLoginId() != null) {
            // 이미 연결된 계정 → 프론트는 바로 로그인 처리
            return new SocialLoginResult(true, null, acc.getEmail());
        }

        // 미연결 → 가입완료 폼을 띄우기 위한 1회성 티켓 발급
        String ticket = UUID.randomUUID().toString();
        acc.setSignupTicket(ticket);
        acc.setSignupTicketExpireAt(LocalDateTime.now().plusMinutes(10));
        acc.setEmail(emailMaybe);
        socialAccountRepo.save(acc);

        return new SocialLoginResult(false, ticket, acc.getEmail());
    }

    // ========= 2) 가입 완료(사용자가 loginId 등 입력 후 호출) =========
    @Transactional
    public UserDetails completeSignup(SocialSignupCompleteRequest req) {
        var acc = socialAccountRepo.findBySignupTicket(req.getTicket())
            .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 티켓"));

        if (acc.getSignupTicketExpireAt() == null || acc.getSignupTicketExpireAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("티켓 만료");
        }
        if (acc.getLoginId() != null) {
            throw new IllegalStateException("이미 연결된 소셜 계정");
        }

        // 1) 전역 유니크 확보 (user_index)
        if (userIndexRepo.existsByLoginId(req.getLoginId())) {
            throw new IllegalArgumentException("이미 사용 중인 ID");
        }
        Role role = Role.valueOf(req.getRole()); // "SHIPPER" or "DRIVER"
        userIndexRepo.save(UserIndex.builder()
            .loginId(req.getLoginId())
            .role(role)
            .build());

        // 2) 역할별 본 테이블 insert
        switch (role) {
            case SHIPPER -> {
                var m = Member.builder()
                    .memId(req.getLoginId())
                    .memPw(encoder.encode(req.getPassword()))
                    .memEmail(req.getEmail())
                    .memName(req.getName())
                    .memPhone(req.getPhone())
                    .memAddress(req.getAddress())
                    .memCreateIdDateTime(LocalDateTime.now())
                    .build();
                memberRepo.save(m);
            }
            case DRIVER -> {
                var c = CargoOwner.builder()
                    .cargoId(req.getLoginId())
                    .cargoPw(encoder.encode(req.getPassword()))
                    .cargoEmail(req.getEmail())
                    .cargoName(req.getName())
                    .cargoPhone(req.getPhone())
                    .cargoAddress(req.getAddress())
                    .cargoCreatedDateTime(LocalDateTime.now())
                    .build();
                cargoRepo.save(c);
            }
        }

        // 3) 소셜 계정 ↔ 서비스 ID 연결
        acc.setLoginId(req.getLoginId());
        acc.setLinkedAt(LocalDateTime.now());
        acc.setSignupTicket(null);
        acc.setSignupTicketExpireAt(null);
        socialAccountRepo.save(acc);

        // 4) 최종 UserDetails 반환(로그인 처리용)
        if (role == Role.SHIPPER) {
            var member = memberRepo.findByMemId(req.getLoginId())
                .orElseThrow(() -> new IllegalStateException("가입 직후 Member 조회 실패"));
            return MemberDTO.fromMember(member); // 내부에서 roles 자동 추론
        } else {
            var cargo = cargoRepo.findByCargoId(req.getLoginId())
                .orElseThrow(() -> new IllegalStateException("가입 직후 CargoOwner 조회 실패"));
            return CargoOwnerDTO.fromCargoOwner(cargo); // 내부에서 roles 자동 추론
        }
    }
}
