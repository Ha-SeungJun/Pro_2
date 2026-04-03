// src/main/java/com/giproject/entity/account/UserIndex.java
package com.giproject.entity.account;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_index",
    uniqueConstraints = {
        // 이메일 전역 유니크 (MySQL 기본 collation이 CI면 생략 가능)
        @UniqueConstraint(name = "uk_user_index_email", columnNames = "email"),
        // 같은 소셜 공급자 내에서는 providerId 유니크
        @UniqueConstraint(name = "uk_user_index_provider", columnNames = {"provider", "provider_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class UserIndex {

    public enum Role { SHIPPER, DRIVER, ADMIN }

    /** 내부 로그인 키(회원가입 시 결정) — PK */
    @Id
    @Column(name = "login_id", length = 50, nullable = false)
    private String loginId;

    /** 최상위 역할 (SHIPPER/DRIVER/ADMIN) */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20, nullable = false)
    private Role role;

    /** 전역 유니크 이메일 */
    @Column(
        name = "email",
        length = 255,
        nullable = false,
        columnDefinition = "varchar(255) COLLATE utf8mb4_0900_ai_ci"
    )
    private String email;

    /** 소셜 공급자 (예: GOOGLE/KAKAO/NAVER), 로컬 회원은 null */
    @Column(name = "provider", length = 20)
    private String provider;

    /** 소셜 공급자 내 사용자 식별자 (OIDC sub, Kakao id 등) */
    @Column(name = "provider_id", length = 128)
    private String providerId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void normalize() {
        if (loginId != null)   loginId   = loginId.trim();
        if (email != null)     email     = email.trim().toLowerCase();
        if (provider != null)  provider  = provider.trim().toUpperCase();
        if (providerId != null) providerId = providerId.trim();
    }
}
