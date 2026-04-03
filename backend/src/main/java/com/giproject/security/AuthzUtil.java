package com.giproject.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

public class AuthzUtil {
    public static void assertOwnerOrAdmin(Authentication auth, String targetId) {
        if (auth == null || !auth.isAuthenticated())
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 필요");
        String me = auth.getName(); // 토큰 sub = 로그인 아이디
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (!isAdmin && !me.equals(targetId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인만 변경할 수 있습니다.");
        }
    }
}