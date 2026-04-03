package com.giproject.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Map;

@Component
@Log4j2
@RequiredArgsConstructor
public class JwtTokenUtils {

    // JWTUtil.java와 동일한 비밀키 사용 (호환성을 위해)
    private final String secretKey = "123456789012345678901234567890817682825";

    // 토큰 생성 메서드 (인스턴스)
    public String generateToken(Map<String, Object> valueMap, int min) {
        SecretKey key = null;
        
        try {
            key = Keys.hmacShaKeyFor(secretKey.getBytes("UTF-8"));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

        String jwtStr = Jwts.builder()
                .setHeader(Map.of("typ", "JWT"))
                .setClaims(valueMap)
                .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
                .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(min).toInstant()))
                .signWith(key)
                .compact();

        return jwtStr;
    }

    // 토큰 검증 메서드 (인스턴스)
    public Map<String, Object> validateToken(String token) {
        Map<String, Object> claim = null;

        try {
            log.debug("JWT 토큰 검증 시작 - 토큰 길이: {}", token != null ? token.length() : "null");
            
            SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes("UTF-8"));
            log.debug("JWT 비밀키 생성 완료 - 키 길이: {}", secretKey.length());

            claim = Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
                    
            log.debug("JWT 토큰 파싱 성공 - Claims: {}", claim);
        } catch (Exception e) {
            log.error("JWT 토큰 검증 실패 - 토큰: {}, 에러: {}", 
                     token != null ? token.substring(0, Math.min(20, token.length())) + "..." : "null", 
                     e.getMessage(), e);
            throw new CustomJWTException("Token validation failed: " + e.getMessage());
        }

        return claim;
    }

    // Request에서 사용자 정보를 추출하는 인스턴스 메서드
    public UserInfo getUserInfoFromRequest(HttpServletRequest request) {
        log.debug("JWT 토큰 추출 시작");
        
        String authHeader = request.getHeader("Authorization");
        log.debug("Authorization 헤더: {}", authHeader != null ? "Bearer " + authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : "null");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("JWT 토큰 없음 - Authorization 헤더가 없거나 Bearer로 시작하지 않음");
            return null;
        }
        
        String token = authHeader.substring(7);
        log.debug("JWT 토큰 추출 완료 - 토큰 길이: {}", token.length());
        
        try {
            Map<String, Object> claims = this.validateToken(token);
            UserInfo userInfo = new UserInfo(claims);
            log.debug("사용자 정보 추출 성공 - authorId: {}, roles: {}", userInfo.getAuthorId(), java.util.Arrays.toString(userInfo.getRoles()));
            return userInfo;
        } catch (Exception e) {
            log.error("JWT 토큰에서 사용자 정보 추출 실패: {}", e.getMessage(), e);
            return null;
        }
    }

    // 사용자 정보를 담는 내부 클래스
    public static class UserInfo {
        private final String authorId;
        private final String[] roles;
        
        public UserInfo(Map<String, Object> claims) {
            // JWT Claims에서 사용자 ID 추출 (memId 또는 sub 필드 사용)
            this.authorId = (String) claims.getOrDefault("memId", claims.get("sub"));
            
            // JWT Claims에서 권한 정보 추출 (rolenames 또는 roles 필드 사용)
            Object rolesObj = claims.getOrDefault("rolenames", claims.get("roles"));
            if (rolesObj instanceof java.util.List) {
                @SuppressWarnings("unchecked")
                java.util.List<String> roleList = (java.util.List<String>) rolesObj;
                this.roles = roleList.toArray(new String[0]);
            } else if (rolesObj instanceof String[]) {
                this.roles = (String[]) rolesObj;
            } else if (rolesObj instanceof String) {
                this.roles = new String[]{(String) rolesObj};
            } else {
                this.roles = new String[0];
            }
        }
        
        public String getAuthorId() {
            return authorId;
        }
        
        public String[] getRoles() {
            return roles;
        }
        
        public boolean hasRole(String role) {
            if (roles == null) return false;
            for (String userRole : roles) {
                if (role.equals(userRole)) {
                    return true;
                }
            }
            return false;
        }
        
        public boolean isAdmin() {
            return hasRole("ADMIN") || hasRole("ROLE_ADMIN") || (authorId != null && authorId.toLowerCase().contains("admin"));
        }
    }
}