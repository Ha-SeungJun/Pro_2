package com.giproject.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpMethod;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    private static final AntPathMatcher MATCHER = new AntPathMatcher();

    /**
     * JWT 검사에서 제외할 경로 패턴들
     * - OAuth2 인가 진입/콜백
     * - 공개 API(회원가입/로그인 등)
     * - 정적/리소스
     */
    private static final List<String> EXCLUDES = List.of(
        "/", "/error", "/favicon.ico",
        "/h2-console/**",
        "/uploads/**",
        "/g2i4/**",

        // === 공개 Auth/API ===
        "/api/auth/login",
        "/api/auth/refresh",
        "/api/auth/signup",
        "/api/auth/check-id",     // ✅ SecurityConfig와 일치
        "/api/email/**",

        // === OAuth2 ===
        "/oauth2/authorization/**",
        "/login/oauth2/**",

        // === 정적 리소스 ===
        "/favicon.ico", "/error", "/",
        "/h2-console/**", "/uploads/**",
        "/api/auth/login", "/api/auth/refresh", "/api/auth/signup",
        "/api/signup/check-id", "/api/email/**",
        "/oauth2/authorization/**", "/login/oauth2/**",
        "/css/**", "/js/**", "/images/**", "/webjars/**",
        "/**/*.css", "/**/*.js", "/**/*.png", "/**/*.jpg", "/**/*.jpeg",
        "/**/*.gif", "/**/*.svg", "/**/*.ico"
    );

    /**
     * 사전 검사: OPTIONS 및 제외 경로는 필터를 타지 않음
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        // context-path 유무에 안전: servletPath 기준
        String p = request.getServletPath();
        String method = request.getMethod();
        
        return p.startsWith("/oauth2/")
        	|| p.startsWith("/api/email/")
            || p.startsWith("/login/")          // 콜백/실패 포함 ("/login/oauth2/**"만으로는 부족)
            || p.startsWith("/h2-console/")
            || p.startsWith("/uploads/")
            || p.startsWith("/api/auth/")       // 공개 인증 관련 API 묶음
            || p.startsWith("/assets/") || p.startsWith("/static/")
            || p.startsWith("/css/") || p.startsWith("/js/") || p.startsWith("/images/")
            // QABoard 조회 API는 인증 없이 접근 가능, 작성/수정/삭제는 JWT 필요
            || (p.startsWith("/api/qaboard/") && "GET".equals(method) && !p.contains("/my"))
            // 공지사항 조회는 인증 없이 접근 가능
            || (p.startsWith("/api/notices") && "GET".equals(method));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // Authorization 헤더가 없거나 Bearer로 시작하지 않으면 패스
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring("Bearer ".length()).trim();

        try {
            // 이미 인증된 컨텍스트가 있으면 재설정 불필요
            if (SecurityContextHolder.getContext().getAuthentication() == null && jwtService.validate(token)) {
                var authentication = jwtService.toAuthentication(token, userDetailsService);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else if (!jwtService.validate(token)) {
                // 유효하지 않은 토큰이면 컨텍스트 정리(혹시 모를 잔존값 제거)
                SecurityContextHolder.clearContext();
                log.debug("Invalid JWT token");
            }
        } catch (Exception ex) {
            // 토큰 파싱/검증 중 예외가 나도 요청 자체는 계속 진행 (엔드포인트 권한체크가 최종 처리)
            SecurityContextHolder.clearContext();
            log.debug("JWT parse/validate error: {}", ex.getMessage());
        }

        chain.doFilter(request, response);
    }
}
