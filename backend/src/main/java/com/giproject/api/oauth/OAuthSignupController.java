// src/main/java/com/giproject/api/oauth/OAuthSignupController.java
package com.giproject.api.oauth;

import com.giproject.entity.oauth.SocialAccount;
import com.giproject.repository.oauth.SocialAccountRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/oauth")
@RequiredArgsConstructor
public class OAuthSignupController {

    private final SocialAccountRepo socialAccountRepo;

    /**
     * 첫 소셜 로그인 직후, HttpOnly 쿠키(signup_ticket)로 이메일/프로바이더를 조회해
     * 프론트 회원가입 폼을 자동 채움.
     *
     * 200 OK: { email, provider }
     * 401 UNAUTHORIZED: "missing_ticket"
     * 404 NOT_FOUND: "invalid_ticket"
     * 410 GONE: "ticket_expired"
     */
    @GetMapping({"/pending-info", "/signup-context"}) // 구 경로 호환
    public ResponseEntity<?> getPendingInfo(HttpServletRequest request) {
        String ticket = readCookie(request, "signup_ticket");
        if (ticket == null || ticket.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("missing_ticket");
        }

        SocialAccount acc = socialAccountRepo.findBySignupTicket(ticket).orElse(null);
        if (acc == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("invalid_ticket");
        }
        if (acc.getSignupTicketExpireAt() == null
                || acc.getSignupTicketExpireAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.GONE).body("ticket_expired");
        }

        Map<String, Object> body = new HashMap<>();
        body.put("email", acc.getEmail());
        body.put("provider", acc.getProvider() != null
                ? acc.getProvider().name().toLowerCase()
                : null);

        return ResponseEntity.ok(body);
    }

    private String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        return Arrays.stream(cookies)
                .filter(c -> name.equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
    }
}
