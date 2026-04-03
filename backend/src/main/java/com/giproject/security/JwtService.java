// src/main/java/com/giproject/security/JwtService.java
package com.giproject.security;

import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${jwt.secret:CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_256_BITS_MINIMUM_1234567890}")
    private String secret;

    @Value("${jwt.issuer:giproject}")
    private String issuer;

    @Value("${jwt.access.expSeconds:1800}")    // 30분
    private long accessExpSeconds;

    @Value("${jwt.refresh.expSeconds:604800}") // 7일
    private long refreshExpSeconds;

    /* =========================
     * Key & Parser
     * ========================= */
    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private JwtParser parser() {
        return Jwts.parser()
                .requireIssuer(issuer)
                .verifyWith(key())
                .build();
    }

    /* =========================
     * 공통 빌더
     * ========================= */
    private String build(String subject, Map<String, Object> claims, long ttlSeconds) {
        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("JWT subject(sub) is required");
        }
        Instant now = Instant.now();
        Map<String, Object> safe = new HashMap<>(claims != null ? claims : Map.of());
        return Jwts.builder()
                .claims(safe)
                .subject(subject)
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    /* =========================
     * 임시(프리필/비번리셋 등) 토큰
     * ========================= */
    public String createTempToken(String subject, Map<String, Object> claims, long expiresInSeconds) {
        return build(subject, claims, expiresInSeconds);
    }

    // (선택) 하위호환/편의 오버로드: subject 추정 후 생성
    public String createTempToken(Map<String, Object> claims, long expiresInSeconds) {
        String subject = String.valueOf(
                claims != null
                        ? (claims.getOrDefault("loginId",
                           claims.getOrDefault("memId",
                           claims.getOrDefault("email", "TEMP"))))
                        : "TEMP"
        );
        return build(subject, claims, expiresInSeconds);
    }

    public Map<String, Object> parseTempToken(String token) {
        Jws<Claims> jws = parser().parseSignedClaims(token);
        return jws.getPayload(); // Claims implements Map<String, Object>
    }

    /** 가입 컨텍스트 별칭 */
    public Claims parseSignupToken(String token) {
        return parseToken(token);
    }

    /* =========================
     * Access / Refresh (Map + subject)
     * ========================= */
    public String createAccessToken(Map<String, Object> claims, String subject) {
        return build(subject, claims, accessExpSeconds);
    }

    public String createRefreshToken(Map<String, Object> claims, String subject) {
        return build(subject, claims, refreshExpSeconds);
    }

    /* =========================
     * Authentication 기반 (로컬/소셜 공통)
     * - sub: 로그인 ID (authentication.getName())
     * - loginId 클레임 포함 (요구사항)
     * ========================= */
    public String generateAccessToken(Authentication authentication) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + accessExpSeconds * 1000);

        Object principal = authentication.getPrincipal();
        String email = "";
        if (principal instanceof MemberDTO m) {
            email = m.getMemEmail();
        } else if (principal instanceof CargoOwnerDTO c) {
            email = c.getCargoEmail();
        }

        String loginId = authentication.getName(); // UserDetails#getUsername

        return Jwts.builder()
                .subject(loginId) // sub = 로그인 ID
                .claim("loginId", loginId) // ✅ 요구사항: 토큰에 회원가입 때 사용한 ID 포함
                .claim("email", email)
                .claim("roles", authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()))
                .issuer(issuer)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    public String generateRefreshToken(Authentication authentication) {
        return build(authentication.getName(), Map.of(), refreshExpSeconds);
    }

    public long getRefreshExpSeconds() {
        return refreshExpSeconds;
    }

    public long getAccessExpiresInSeconds() {
        return accessExpSeconds;
    }

    /* =========================
     * 파서 & 유틸
     * ========================= */
    public Claims parseToken(String token) {
        return parser().parseSignedClaims(token).getPayload();
    }

    public boolean validate(String token) {
        try {
            parser().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsername(String token) {
        return parseToken(token).getSubject();
    }

    public Authentication toAuthentication(String token, UserDetailsService uds) {
        var user = uds.loadUserByUsername(getUsername(token));
        return new UsernamePasswordAuthenticationToken(user, token, user.getAuthorities());
    }
}
