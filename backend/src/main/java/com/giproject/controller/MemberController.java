package com.giproject.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;
import com.giproject.service.member.GoogleOAuthService;
import com.giproject.service.member.MemberService;
import com.giproject.service.member.NaverOAuthService;
import com.giproject.utils.JWTUtil;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@RestController
@RequestMapping({"/api/signup", "/g2i4/member"}) // ✅ 두 prefix 모두 허용
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;
    private final MemberService memberService;
    private final NaverOAuthService naverOAuthService;
    private final GoogleOAuthService googleOAuthService;

    // 로그인된 사용자 정보 조회
    @GetMapping("/info")
    public MemberDTO getMemberInfo(HttpSession session) {
        String memId = (String) session.getAttribute("loginId");
        Member member = memberRepository.findById(memId).orElseThrow(() -> new RuntimeException("회원 정보 없음"));

        return new MemberDTO(
            member.getMemId(),
            null,
            member.getMemEmail(),
            member.getMemName(),
            member.getMemPhone(),
            member.getMemAddress(),
            member.getMemCreateIdDateTime(),
            member.getMemberRoleList()
        );
    }

    @GetMapping("/api/member/kakao")
    public Map<String, Object> getMemberFromKakao(@RequestParam("accessToken") String accessToKen) {
        log.info("---------------------accessToken--------------------- :::: " + accessToKen);

        MemberDTO dto = memberService.getKakaoMember(accessToKen);
        Map<String, Object> claims = dto.getClaims();

        String jwtAccessToken = JWTUtil.generateToken(claims, 10 * 6);
        String jwtRefreshToken = JWTUtil.generateToken(claims, 60 * 24);

        log.info("jwtAccessToken -----------------> " + jwtAccessToken);
        log.info("jwtRefreshToken -----------------> " + jwtRefreshToken);

        claims.put("accessToken", jwtAccessToken);
        claims.put("refreshToken", jwtRefreshToken);

        return claims;
    }

    @GetMapping("/naver/callback")
    public Map<String, Object> naverCallback(@RequestParam String code, @RequestParam String state) {
        String accessToken = naverOAuthService.getAccessToken(code, state);
        Map<String, Object> userProfile = naverOAuthService.getUserProfile(accessToken);
        return userProfile;
    }

    @GetMapping("/google/callback")
    public Map<String, Object> googleCallback(@RequestParam("code") String code) {
        String accessToken = googleOAuthService.getAccessToken(code);
        MemberDTO dto = memberService.getGoogleMember(accessToken);

        Map<String, Object> claims = dto.getClaims();
        String jwtAccessToken = JWTUtil.generateToken(claims, 10 * 6);
        String jwtRefreshToken = JWTUtil.generateToken(claims, 60 * 24);

        claims.put("accessToken", jwtAccessToken);
        claims.put("refreshToken", jwtRefreshToken);

        return claims;
    }

    @GetMapping(value="/check-id", produces="application/json")
    public Map<String, Object> checkId(@RequestParam("memId") String memId) {
        String normalized = memId == null ? "" : memId.strip().toLowerCase(java.util.Locale.ROOT);
        boolean exists = memberRepository.existsById(normalized);
        return java.util.Map.of("available", !exists, "normalized", normalized);
    }
}
