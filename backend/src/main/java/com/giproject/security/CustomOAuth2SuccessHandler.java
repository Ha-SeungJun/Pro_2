// src/main/java/com/giproject/security/CustomOAuth2SuccessHandler.java
package com.giproject.security;

import static com.giproject.security.jwt.JwtClaimKeys.*;

import com.giproject.entity.account.UserIndex;
import com.giproject.entity.oauth.SocialAccount;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.repository.oauth.SocialAccountRepo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final SocialAccountRepo socialAccountRepo;
    private final UserIndexRepository userIndexRepo;                      // ✅ 추가

    @Value("${frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String provider = token.getAuthorizedClientRegistrationId();   // google | kakao | naver
        String providerUp = provider == null ? null : provider.toUpperCase();

        OAuth2User oAuth2User = (OAuth2User) token.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email  = extractEmail(provider, attributes);
        String name   = extractName(provider, attributes);
        String provId = extractProviderId(provider, attributes);

        log.info("OAuth2 success provider={}, email={}, name={}, providerId={}", provider, email, name, provId);

        // 0) 이메일 동의 누락 → 가입 페이지
        if (email == null || email.isBlank()) {
            String redirect = frontendBaseUrl + "/signup?social=" + safe(provider) + "&reason=no_email";
            getRedirectStrategy().sendRedirect(request, response, redirect);
            return;
        }

        // 1) social_account 존재 여부 확인
        SocialAccount.Provider providerEnum;
        try {
            providerEnum = SocialAccount.Provider.valueOf(String.valueOf(providerUp));
        } catch (Exception e) {
            String redirect = frontendBaseUrl + "/signup?social=" + safe(provider) + "&reason=unsupported_provider";
            getRedirectStrategy().sendRedirect(request, response, redirect);
            return;
        }

        var linkOpt = socialAccountRepo.findByProviderAndProviderUserId(providerEnum, provId);
        if (linkOpt.isPresent()) {
            SocialAccount sa = linkOpt.get();

            // ✅ LAZY 회피: user를 건드리지 말고 loginId로 식별
            String subject = sa.getLoginId();
            if (subject == null || subject.isBlank()) {
                // (예외적) 예전 데이터 대비: 그래도 null이면 가입 흐름으로
                gotoSignupWithTicket(response, request, providerEnum, email, name, provId);
                return;
            }

            // 권한 계산: UserIndex에서 role만 조회 (LAZY 아님)
            List<String> roles = new ArrayList<>();
            userIndexRepo.findByLoginId(subject).ifPresent(ui -> {
                if (ui.getRole() != null) roles.add("ROLE_" + ui.getRole().name());
            });
            if (roles.stream().noneMatch("ROLE_ADMIN"::equals)) roles.add("ROLE_USER");

            Map<String, Object> claims = new HashMap<>();
            claims.put(EMAIL, email);
            claims.put(UID, subject);
            claims.put(ROLES, new ArrayList<>(new LinkedHashSet<>(roles)));
            claims.put(PROVIDER, providerEnum.name());
            claims.put(PROVIDER_ID, provId);

            String access  = jwtService.createAccessToken(claims, subject);
            String refresh = jwtService.createRefreshToken(Map.of(UID, subject), subject);

            String hash = "#access=" + url(access) + "&refresh=" + url(refresh);
            getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl + "/auth/callback" + hash);
            return;
        }

        // 2) 연결 미존재 → 가입 티켓 발급
        gotoSignupWithTicket(response, request, providerEnum, email, name, provId);
    }

    private void gotoSignupWithTicket(HttpServletResponse response, HttpServletRequest request,
                                      SocialAccount.Provider providerEnum, String email, String name, String provId) throws IOException {
        Map<String, Object> prefill = new HashMap<>();
        prefill.put(EMAIL, email);
        prefill.put(PROVIDER, providerEnum.name());
        if (name != null)   prefill.put("name", name);
        if (provId != null) prefill.put(PROVIDER_ID, provId);
        prefill.put("purpose", "signup");

        String tempSubject = (provId != null)
                ? (providerEnum.name() + ":" + provId)
                : ("SOCIAL_PREFILL:" + email);

        long ttlSeconds = 5 * 60;
        String signupTicket = jwtService.createTempToken(tempSubject, prefill, ttlSeconds);

        String hash = "#signup_ticket=" + url(signupTicket) + "&social=" + providerEnum.name().toLowerCase();
        getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl + "/signup" + hash);
    }

    /* ===== extractors ===== */
    @SuppressWarnings("unchecked")
    private String extractEmail(String provider, Map<String, Object> attributes) {
        if ("google".equals(provider)) {
            return (String) attributes.get("email");
        } else if ("kakao".equals(provider)) {
            Map<String, Object> acc = (Map<String, Object>) attributes.get("kakao_account");
            return acc == null ? null : (String) acc.get("email");
        } else if ("naver".equals(provider)) {
            Map<String, Object> resp = (Map<String, Object>) attributes.get("response");
            return resp == null ? null : (String) resp.get("email");
        }
        return null;
    }
    @SuppressWarnings("unchecked")
    private String extractName(String provider, Map<String, Object> attributes) {
        if ("google".equals(provider)) {
            Object v = attributes.getOrDefault("name", attributes.get("given_name"));
            return v == null ? null : v.toString();
        } else if ("kakao".equals(provider)) {
            Map<String, Object> acc = (Map<String, Object>) attributes.get("kakao_account");
            Map<String, Object> profile = acc == null ? null : (Map<String, Object>) acc.get("profile");
            Object nick = profile == null ? null : profile.get("nickname");
            return nick == null ? null : nick.toString();
        } else if ("naver".equals(provider)) {
            Map<String, Object> resp = (Map<String, Object>) attributes.get("response");
            Object nm = resp == null ? null : resp.get("name");
            return nm == null ? null : nm.toString();
        }
        return null;
    }
    @SuppressWarnings("unchecked")
    private String extractProviderId(String provider, Map<String, Object> attributes) {
        if ("google".equals(provider)) {
            Object sub = attributes.get("sub");
            return sub == null ? null : sub.toString();
        } else if ("kakao".equals(provider)) {
            Object id = attributes.get("id");
            return id == null ? null : String.valueOf(id);
        } else if ("naver".equals(provider)) {
            Map<String, Object> resp = (Map<String, Object>) attributes.get("response");
            Object id = resp == null ? null : resp.get("id");
            return id == null ? null : id.toString();
        }
        return null;
    }

    private static String url(String s) { return URLEncoder.encode(s, StandardCharsets.UTF_8); }
    private static String safe(String s) { return s == null ? "" : s; }
}
