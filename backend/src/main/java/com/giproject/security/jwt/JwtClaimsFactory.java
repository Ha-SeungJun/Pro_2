// src/main/java/com/giproject/security/jwt/JwtClaimsFactory.java
package com.giproject.security.jwt;

import static com.giproject.security.jwt.JwtClaimKeys.*;

import com.giproject.dto.member.MemberDTO;
import com.giproject.dto.cargo.CargoOwnerDTO;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class JwtClaimsFactory {

    /** Authentication → subject(memId/cargoId 등 내부 로그인키) */
    public String resolveSubject(Authentication authentication) {
        String name = authentication.getName();
        Object p = authentication.getPrincipal();

        if (p instanceof MemberDTO m && m.getMemId() != null && !m.getMemId().isBlank()) return m.getMemId();
        if (p instanceof CargoOwnerDTO c && c.getCargoId() != null && !c.getCargoId().isBlank()) return c.getCargoId();

        if (name == null || name.isBlank()) {
            throw new IllegalStateException("Cannot resolve JWT subject from Authentication");
        }
        return name;
    }

    /** Access 토큰용 클레임 (공통 + 소셜 옵션) */
    public Map<String, Object> forAccess(Authentication authentication, ProviderInfo providerInfo) {
        Map<String, Object> c = baseClaims(authentication);
        if (providerInfo != null && providerInfo.present()) {
            ProviderInfo p = providerInfo.requireUpper();
            c.put(PROVIDER, p.provider());
            c.put(PROVIDER_ID, p.providerId());
        }
        return c;
    }

    /** Refresh 토큰용 클레임 (최소화 권장) */
    public Map<String, Object> forRefresh(Authentication authentication) {
        Map<String, Object> c = new HashMap<>();
        Object p = authentication.getPrincipal();

        if (p instanceof MemberDTO m && m.getMemId() != null && !m.getMemId().isBlank()) {
            c.put(UID, m.getMemId());
            c.put("loginId", m.getMemId()); // alias
        } else if (p instanceof CargoOwnerDTO co && co.getCargoId() != null && !co.getCargoId().isBlank()) {
            c.put(UID, co.getCargoId());
            c.put("loginId", co.getCargoId()); // alias
        } else {
            // principal에 없으면 authentication.getName() 사용
            String loginId = authentication.getName();
            if (loginId != null && !loginId.isBlank()) {
                c.put(UID, loginId);
                c.put("loginId", loginId); // alias
            }
        }
        return c;
    }

    /** 소셜 첫가입 프리필(임시 토큰)용 — 이름은 넣지 않음 */
    public Map<String, Object> forSignupPrefill(String email, ProviderInfo providerInfo) {
        Map<String, Object> c = new HashMap<>();
        if (email != null && !email.isBlank()) c.put(EMAIL, email);
        if (providerInfo != null && providerInfo.present()) {
            ProviderInfo p = providerInfo.requireUpper();
            c.put(PROVIDER, p.provider());
            c.put(PROVIDER_ID, p.providerId());
        }
        return c;
    }

    // ---- 내부 공통 ----
    private Map<String, Object> baseClaims(Authentication authentication) {
        Map<String, Object> c = new HashMap<>();

        // roles
        c.put(ROLES, authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList());

        // 기본 loginId 세팅 (이름은 넣지 않음)
        String loginId = authentication.getName();
        putIfPresent(c, UID, loginId);           // uid = loginId
        putIfPresent(c, "loginId", loginId);     // alias

        // 이메일 및 더 정확한 ID로 덮어쓰기
        Object p = authentication.getPrincipal();
        if (p instanceof MemberDTO m) {
            putIfPresent(c, EMAIL, m.getMemEmail());
            putIfPresent(c, UID,   m.getMemId());      // override
            putIfPresent(c, "loginId", m.getMemId());  // alias override
        } else if (p instanceof CargoOwnerDTO co) {
            putIfPresent(c, EMAIL, co.getCargoEmail());
            putIfPresent(c, UID,   co.getCargoId());   // override
            putIfPresent(c, "loginId", co.getCargoId());// alias override
        }

        // ❌ NAME(사용자 이름)은 요구사항에 따라 넣지 않는다.
        return c;
    }

    private void putIfPresent(Map<String, Object> map, String key, Object value) {
        if (value == null) return;
        if (value instanceof String s && s.isBlank()) return;
        map.put(key, value);
    }
}
