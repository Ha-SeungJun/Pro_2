package com.giproject.service.member;

import lombok.extern.log4j.Log4j2;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Log4j2
public class GoogleOAuthService {

	@Value("${spring.security.oauth2.client.registration.google.client-id}")
	private String GOOGLE_CLIENT_ID;

	@Value("${spring.security.oauth2.client.registration.google.client-secret}")
	private String GOOGLE_CLIENT_SECRET;

	@Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
	private String GOOGLE_REDIRECT_URI;

    private final String GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token";
    private final String GOOGLE_USERINFO_URI = "https://openidconnect.googleapis.com/v1/userinfo";

    public String getAccessToken(String code) {
        RestTemplate restTemplate = new RestTemplate();

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", GOOGLE_CLIENT_ID);
        params.add("client_secret", GOOGLE_CLIENT_SECRET);
        params.add("redirect_uri", GOOGLE_REDIRECT_URI);
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(GOOGLE_TOKEN_URI, request, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            log.info("Google Token Response: {}", response.getBody());
            return (String) response.getBody().get("access_token");
        } else {
            throw new RuntimeException("구글 액세스 토큰 발급 실패");
        }
    }

    public Map<String, Object> getUserProfile(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                GOOGLE_USERINFO_URI,
                HttpMethod.GET,
                request,
                Map.class
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            log.info("Google User Profile: {}", response.getBody());
            return response.getBody();
        } else {
            throw new RuntimeException("구글 사용자 정보 조회 실패");
        }
    }
}
