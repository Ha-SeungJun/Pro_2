package com.giproject.dto.auth;

import lombok.*;

@Getter @AllArgsConstructor
public class SocialLoginResult {
    private final boolean linked;      // 이미 서비스 계정에 연결됐는지
    private final String  ticket;      // linked=false일 때만 유효
    private final String  email;       // 있으면 프리필용
    // linked=true일 때는 컨트롤러에서 바로 토큰 발급 or 세션 로그인 처리
}
