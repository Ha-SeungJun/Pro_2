package com.giproject.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.giproject.security.CustomOAuth2SuccessHandler;
import com.giproject.security.JwtAuthenticationFilter;
import com.giproject.security.JwtService;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    public SecurityConfig(UserDetailsService userDetailsService,
                          CustomOAuth2SuccessHandler customOAuth2SuccessHandler) {
        this.userDetailsService = userDetailsService;
        this.customOAuth2SuccessHandler = customOAuth2SuccessHandler;
    }

    @Value("${frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    // ✅ JwtAuthenticationFilter Bean
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService,
                                                           UserDetailsService userDetailsService) {
        return new JwtAuthenticationFilter(jwtService, userDetailsService);
    }

    // ✅ AuthenticationProvider Bean
    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(encoder);
        return provider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtAuthenticationFilter,
                                           AuthenticationProvider authenticationProvider) throws Exception {

        http
            // CORS/CSRF/Headers
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .headers(h -> h.frameOptions(f -> f.sameOrigin()))
            // 세션: OAuth2 핸드셰이크에 한해 필요 → IF_REQUIRED
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            // 폼로그인 완전 비활성 (Spring이 /login 리다이렉트 안 하도록)
            .formLogin(AbstractHttpConfigurer::disable)
            // 캐시 끄기(선택)
            .requestCache(rc -> rc.disable())
            // 401/403 직접 내려주기
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> res.sendError(401))
                .accessDeniedHandler((req, res, ex) -> res.sendError(403))
            )
            // OAuth2 설정
            .oauth2Login(o -> o
                .authorizationEndpoint(a -> a.baseUri("/oauth2/authorization"))
                .redirectionEndpoint(r -> r.baseUri("/login/oauth2/code/*"))
                .successHandler(customOAuth2SuccessHandler)
                .failureHandler((req, res, ex) -> {
                    String base = req.getHeader("Origin");
                    if (base == null || base.isBlank()) base = frontendBaseUrl;
                    String msg = ex.getMessage() == null ? "oauth2_failed" : ex.getMessage();
                    String target = base + "/login?error=" +
                        java.net.URLEncoder.encode(msg, java.nio.charset.StandardCharsets.UTF_8);
                    res.sendRedirect(target);
                })
            )
            // 인가 정책
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 정적/SPA 루트
                .requestMatchers("/", "/index.html", "/error", "/favicon.ico",
                                 "/assets/**", "/static/**").permitAll()
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()

                // OAuth 흐름
                .requestMatchers("/oauth2/**", "/login/**").permitAll()

                // 공개 API (로그인/회원가입/이메일인증/리프레시 등)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/email/**").permitAll()

                // 업로드/콘솔 등
                .requestMatchers("/uploads/**", "/h2-console/**").permitAll()

                // 프로젝트 개별 공개 경로 (기존 허용 목록 유지)
                .requestMatchers("/g2i4/subpath/order/**","/g2i4/payment/**","/g2i4/delivery/**","/g2i4/address/**",
                                 "/g2i4/estimate/subpath/**","/g2i4/cargo/**","/g2i4/admin/**","/g2i4/main/**",
                                 "/g2i4/uploads/**","/g2i4/mypage/**","/g2i4/user/**","/g2i4/cargo/**","/g2i4/member/**","/g2i4/qna/**","/api/**").permitAll()

                // 예시: 특정 권한 필요
                .requestMatchers("/g2i4/estimate/list").hasAuthority("ROLE_DRIVER")

                // 나머지는 인증 필요
                .anyRequest().authenticated()
            )
            // 인증 공급자/필터 체인
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // 필요시 도메인 추가
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3002"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // PasswordEncoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
