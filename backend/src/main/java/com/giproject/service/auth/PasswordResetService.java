// src/main/java/com/giproject/service/auth/PasswordResetService.java
package com.giproject.service.auth;

import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;
import com.giproject.security.JwtService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final MemberRepository memberRepository;
    private final JwtService jwtService;                 // createTempToken / parseTempToken 사용
    private final PasswordEncoder passwordEncoder;
    @Nullable private final JavaMailSender mailSender;   // 메일 미구성 시 null

    // application.yml: app.mail.from: no-reply@your-domain.com
    @Value("${app.mail.from:}")
    private String defaultFrom;

    // 간단한 인메모리 스토어(운영 환경은 Redis 등 외부 스토리지 권장)
    private final Map<String, Challenge> store = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    // 설정값
    private final int CODE_DIGITS = 6;
    private final int CHALLENGE_TTL_SEC = 180;      // 인증코드 유효 3분
    private final int RESET_TOKEN_TTL_SEC = 5 * 60; // resetToken 유효 5분

    /* =========================
     * High-level API (컨트롤러에서 사용하기 좋은 형태)
     * ========================= */

    /** (STEP 1) 아이디/이메일 확인 → 챌린지 발급 + 메일 발송 → 응답 DTO 반환 */
    public IssueResult startReset(String loginId, String email) {
        // 1) 회원 존재/이메일 매칭 검증
        Member m = memberRepository.findById(loginId)
                .orElseThrow(() -> new NoSuchElementException("NO_SUCH_USER"));
        if (m.getMemEmail() == null || !m.getMemEmail().equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("EMAIL_NOT_MATCH");
        }

        // 2) 챌린지 발급 + 메일 발송
        Challenge ch = issueChallenge(loginId, email);
        sendCodeEmail(email, ch.code());

        return new IssueResult(
                ch.id(),
                maskEmail(email),
                ch.getTtlSeconds()
        );
    }

    /** (STEP 2) 코드 검증 → 성공 시 resetToken 발급 → 응답 DTO 반환 */
    public VerifyResult verifyCode(String challengeId, String code) {
        return verifyAndIssueResetToken(challengeId, code)
                .map(VerifyResult::new)
                .orElseThrow(() -> new IllegalArgumentException("INVALID_OR_EXPIRED_CODE"));
    }

    /** (STEP 3) resetToken 검증 → 비밀번호 변경 */
    public void completeReset(String resetToken, String newPassword) {
        boolean ok = resetPassword(resetToken, newPassword);
        if (!ok) throw new IllegalArgumentException("INVALID_RESET_TOKEN");
    }

    /* =========================
     * Low-level 내부 로직
     * ========================= */

    /** 1) 챌린지 발급 */
    public Challenge issueChallenge(String loginId, String email) {
        String id = UUID.randomUUID().toString();
        String code = randomCode(CODE_DIGITS);
        Instant expiresAt = Instant.now().plusSeconds(CHALLENGE_TTL_SEC);
        Challenge ch = new Challenge(id, loginId, email, code, expiresAt);
        store.put(id, ch);
        log.info("[PWD_RESET] issue challenge id={}, loginId={}, email={}, code={}", id, loginId, email, code);
        return ch;
    }

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void sendCodeEmail(String email, String code) {
        if (mailSender == null) {
            log.warn("[PWD_RESET] JavaMailSender 미구성 — code={} to={}", code, email);
            return;
        }
        try {
            SimpleMailMessage m = new SimpleMailMessage();
            m.setTo(email);

            // ✅ 헤더 From 을 명확하게 설정 (username 과 동일 권장)
            String from = (defaultFrom != null && !defaultFrom.isBlank())
                    ? defaultFrom
                    : mailUsername;
            if (from != null && !from.isBlank()) {
                m.setFrom(from);
            }

            m.setSubject("[g2i4] 비밀번호 재설정 인증코드");
            m.setText("인증코드: " + code + "\n유효 시간: " + CHALLENGE_TTL_SEC + "초");

            mailSender.send(m);
        } catch (Exception e) {
            log.error("[PWD_RESET] 메일 발송 실패: {}", e.getMessage(), e);
        }
    }

    /** 2) 코드 검증 → resetToken 발급 */
    public Optional<String> verifyAndIssueResetToken(String challengeId, String code) {
        Challenge ch = store.get(challengeId);
        if (ch == null) return Optional.empty();
        if (Instant.now().isAfter(ch.expiresAt())) {
            store.remove(challengeId);
            return Optional.empty();
        }
        if (!Objects.equals(ch.code(), code)) {
            return Optional.empty();
        }
        // 일회성 사용 — 사용 후 제거
        store.remove(challengeId);

        Map<String, Object> claims = Map.of(
                "purpose", "pwd_reset",
                "loginId", ch.loginId()
        );

        // 🔧 FIX: subject(=loginId) 를 함께 전달
        String resetToken = jwtService.createTempToken(ch.loginId(), claims, RESET_TOKEN_TTL_SEC);
        return Optional.of(resetToken);
    }

    /** 3) resetToken 검증 → 비밀번호 변경 */
    public boolean resetPassword(String resetToken, String newPwRaw) {
        Map<String, Object> claims;
        try {
            claims = jwtService.parseTempToken(resetToken);
        } catch (Exception e) {
            log.warn("[PWD_RESET] resetToken 파싱 실패: {}", e.getMessage());
            return false;
        }
        String purpose = String.valueOf(claims.get("purpose"));
        if (!"pwd_reset".equals(purpose)) return false;

        String loginId = String.valueOf(claims.get("loginId"));
        Optional<Member> om = memberRepository.findById(loginId);
        if (om.isEmpty()) return false;

        Member m = om.get();
        m.setMemPw(passwordEncoder.encode(newPwRaw)); // 반드시 암호화
        memberRepository.save(m);
        log.info("[PWD_RESET] password reset for loginId={}", loginId);
        return true;
    }

    /* =========================
     * 유틸
     * ========================= */

    private String randomCode(int digits) {
        int bound = (int) Math.pow(10, digits);
        int n = random.nextInt(bound);
        return String.format("%0" + digits + "d", n);
    }

    /** 간단한 이메일 마스킹: user****@do***.com */
    private String maskEmail(String email) {
        try {
            int at = email.indexOf('@');
            if (at <= 1) return "****" + email.substring(Math.max(0, at));
            String local = email.substring(0, at);
            String domain = email.substring(at + 1);

            String localMasked = local.substring(0, Math.min(2, local.length()))
                    + "****";

            int dot = domain.lastIndexOf('.');
            if (dot <= 0) return localMasked + "@****";
            String host = domain.substring(0, dot);
            String tld = domain.substring(dot); // .com

            String hostMasked = host.substring(0, Math.min(2, host.length())) + "***";
            return localMasked + "@" + hostMasked + tld;
        } catch (Exception e) {
            return "****";
        }
    }

    /** 챌린지 DTO(레코드) */
    public static record Challenge(
            String id,
            String loginId,
            String email,
            String code,
            Instant expiresAt
    ) {
        public int getTtlSeconds() {
            long sec = expiresAt.getEpochSecond() - Instant.now().getEpochSecond();
            return (int) Math.max(0, sec);
        }
        public String getId() { return id; }
        public String getCode() { return code; }
    }

    /* 컨트롤러 응답 DTO */
    @Getter
    public static class IssueResult {
        private final String challengeId;
        private final String maskedEmail;
        private final int ttlSeconds;
        public IssueResult(String challengeId, String maskedEmail, int ttlSeconds) {
            this.challengeId = challengeId;
            this.maskedEmail = maskedEmail;
            this.ttlSeconds = ttlSeconds;
        }
    }

    @Getter
    public static class VerifyResult {
        private final String resetToken;
        public VerifyResult(String resetToken) { this.resetToken = resetToken; }
    }
}
