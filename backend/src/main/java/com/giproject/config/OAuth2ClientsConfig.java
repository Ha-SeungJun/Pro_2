package com.giproject.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.client.registration.*;

@Configuration
public class OAuth2ClientsConfig {

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        ClientRegistration google =
            CommonOAuth2Provider.GOOGLE.getBuilder("google")
                .clientId("1056453451424-4ib32lo1sro5f83oj3dlovcrs42a2ple.apps.googleusercontent.com")
                .clientSecret("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")
                .redirectUri("{baseUrl}/login/oauth2/code/google")
                .scope("openid","profile","email")
                .build();
        
        ClientRegistration naver = ClientRegistration.withRegistrationId("naver")
                .clientId("neoUA3EdRmckzWTiDCOh")
                .clientSecret("9TAyhJRbgv")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/naver")
                .scope("name","email")
                .authorizationUri("https://nid.naver.com/oauth2.0/authorize")
                .tokenUri("https://nid.naver.com/oauth2.0/token")
                .userInfoUri("https://openapi.naver.com/v1/nid/me")
                .userNameAttributeName("response")
                .clientName("Naver")
                .build();

            ClientRegistration kakao = ClientRegistration.withRegistrationId("kakao")
                .clientId("565114d3ec7b2515badd76cddff1136a")
                // client secret을 쓰지 않으면 아래 두 줄은 제거
                .clientSecret("zfp2TkCWYXcJ3obFr691DyQVd8b2pQtE")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/kakao")
                .scope("account_email","profile_nickname")
                .authorizationUri("https://kauth.kakao.com/oauth/authorize")
                .tokenUri("https://kauth.kakao.com/oauth/token")
                .userInfoUri("https://kapi.kakao.com/v2/user/me")
                .userNameAttributeName("id")
                .clientName("Kakao")
                .build();
            
        return new InMemoryClientRegistrationRepository(google, naver, kakao);
    }
}