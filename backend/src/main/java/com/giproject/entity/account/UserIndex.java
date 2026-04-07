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
        @UniqueConstraint(name = "uk_user_index_email", columnNames = "email"),
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

    @Id
    @Column(name = "login_id", length = 50, nullable = false)
    private String loginId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20, nullable = false)
    private Role role;

    @Column(
        name = "email",
        length = 255,
        nullable = false,
        columnDefinition = "varchar(255) COLLATE utf8mb4_0900_ai_ci"
    )
    private String email;

    @Column(name = "provider", length = 20)
    private String provider;

    @Column(name = "provider_id", length = 128)
    private String providerId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(name = "suspended", nullable = false)
    private Boolean suspended = Boolean.FALSE;

    @Column(name = "suspend_start_at")
    private LocalDateTime suspendStartAt;

    @Column(name = "suspend_end_at")
    private LocalDateTime suspendEndAt;

    @Column(name = "suspend_reason", length = 500)
    private String suspendReason;

    @PrePersist
    @PreUpdate
    void normalize() {
        if (loginId != null) loginId = loginId.trim();
        if (email != null) email = email.trim().toLowerCase();
        if (provider != null) provider = provider.trim().toUpperCase();
        if (providerId != null) providerId = providerId.trim();
        if (suspended == null) suspended = Boolean.FALSE;
    }

    public void suspend(LocalDateTime startAt, LocalDateTime endAt, String reason) {
        this.suspended = Boolean.TRUE;
        this.suspendStartAt = startAt;
        this.suspendEndAt = endAt;
        this.suspendReason = reason;
    }

    public void clearSuspend() {
        this.suspended = Boolean.FALSE;
        this.suspendStartAt = null;
        this.suspendEndAt = null;
        this.suspendReason = null;
    }

    public boolean isPermanentSuspension() {
        return Boolean.TRUE.equals(this.suspended) && this.suspendEndAt == null;
    }

    public boolean isSuspensionExpired() {
        return Boolean.TRUE.equals(this.suspended)
                && this.suspendEndAt != null
                && LocalDateTime.now().isAfter(this.suspendEndAt);
    }

    public boolean isCurrentlySuspended() {
        if (!Boolean.TRUE.equals(this.suspended)) {
            return false;
        }
        if (this.suspendEndAt == null) {
            return true; // 영구정지
        }
        return LocalDateTime.now().isBefore(this.suspendEndAt);
    }
}