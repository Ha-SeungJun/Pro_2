package com.giproject.dto.member;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.member.Member;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = {"memPw", "accessToken", "refreshToken"}) // 비번/토큰 로그 노출 방지
public class MemberDTO extends User {

    private static final long serialVersionUID = 1L;

    private String memId;

    @JsonIgnore
    private String memPw;

    private String memEmail;
    private String memName;
    private String memPhone;
    private String memAddress;
    private LocalDateTime memCreateIdDateTime;

    private List<String> roleNames = new ArrayList<>();

    private String provider;
    private String socialId;

    private String accessToken;
    private String refreshToken;

    public MemberDTO(String memId,
                     String memPw,
                     String memEmail,
                     String memName,
                     String memPhone,
                     String memAddress,
                     LocalDateTime memCreateIdDateTime,
                     List<String> rolenames) {

        super(
            memId,
            (memPw == null ? "" : memPw),
            rolenames.stream()
                     .filter(Objects::nonNull)
                     .map(String::trim)
                     .filter(s -> !s.isEmpty())
                     .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                     .distinct()
                     .map(SimpleGrantedAuthority::new)
                     .collect(Collectors.toList())
        );

        this.memId = memId;
        this.memPw = memPw;
        this.memEmail = memEmail;
        this.memName = memName;
        this.memPhone = memPhone;
        this.memAddress = memAddress;
        this.memCreateIdDateTime = memCreateIdDateTime;
        this.roleNames = (rolenames != null) ? new ArrayList<>(rolenames) : new ArrayList<>();
    }

    /** 안전한 클레임(비밀번호 제외) */
    public Map<String, Object> getClaims() {
        Map<String, Object> m = new HashMap<>();
        m.put("memId", memId);
        m.put("memEmail", memEmail);
        m.put("memName", memName);
        m.put("memPhone", memPhone);
        m.put("memAddress", memAddress);
        m.put("memCreateIdDateTime", memCreateIdDateTime);
        m.put("rolenames", roleNames);
        if (provider != null) m.put("provider", provider);
        if (socialId != null) m.put("socialId", socialId);
        return m;
    }

    /** 엔티티 -> DTO : 도메인=SHIPPER, 플랫폼=(ADMIN|USER) */
    public static MemberDTO fromMember(Member m) {
        boolean isAdmin = false;
        try {
            UserIndex ui = m.getUserIndex();
            isAdmin = (ui != null && ui.getRole() == UserIndex.Role.ADMIN);
        } catch (Exception ignore) {}

        List<String> roles = new ArrayList<>(2);
        roles.add("SHIPPER");                  // 도메인 축
        roles.add(isAdmin ? "ADMIN" : "USER"); // 플랫폼 축

        return new MemberDTO(
            m.getMemId(),
            m.getMemPw(),
            m.getMemEmail(),
            m.getMemName(),
            m.getMemPhone(),
            m.getMemAddress(),
            m.getMemCreateIdDateTime(),
            roles
        );
    }

    /** 토큰까지 한 번에 세팅 */
    public static MemberDTO of(String loginId,
                               String email,
                               String name,
                               String phone,
                               String address,
                               LocalDateTime createdAt,
                               List<String> roles,
                               String accessToken,
                               String refreshToken) {
        MemberDTO dto = new MemberDTO(loginId, "", email, name, phone, address, createdAt, roles);
        dto.setAccessToken(accessToken);
        dto.setRefreshToken(refreshToken);
        return dto;
    }
}
