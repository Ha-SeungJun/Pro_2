// src/main/java/com/giproject/entity/oauth/SocialAccount.java
package com.giproject.entity.oauth;

import com.giproject.entity.account.UserIndex;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "social_account",
    uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "provider_user_id"}),
    indexes = {
        @Index(name = "idx_social_login_id", columnList = "login_id"),
        @Index(name = "idx_social_signup_ticket", columnList = "signup_ticket"),
        @Index(name = "idx_social_user", columnList = "user_id") // ✅ FK 조회용 인덱스
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user") // LAZY 필드 순환/지연로딩 이슈 방지
public class SocialAccount {

    public enum Provider { KAKAO, NAVER, GOOGLE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Provider provider;

    @Column(name = "provider_user_id", nullable = false, length = 128)
    private String providerUserId;

    @Column(name = "email", length = 255)
    private String email; // 소셜 측 이메일(존재 시 보관)

    @Column(name = "login_id", length = 50) // 우리 서비스 로그인 ID(보조 필드)
    private String loginId; // 연결 전엔 null

    @Column(name = "linked_at")
    private LocalDateTime linkedAt;

    // 가입 완료 폼용 1회성 티켓
    @Column(name = "signup_ticket", length = 64)
    private String signupTicket;

    @Column(name = "signup_ticket_expire_at")
    private LocalDateTime signupTicketExpireAt;

    // ✅ UserIndex와 FK 연결 (반드시 complete-signup에서 setUser(ui)로 세팅)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserIndex user;
}
