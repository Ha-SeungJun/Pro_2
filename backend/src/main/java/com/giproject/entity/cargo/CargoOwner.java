// src/main/java/com/giproject/entity/cargo/CargoOwner.java
package com.giproject.entity.cargo;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.giproject.entity.account.UserIndex;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cargo_owner")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = { "cargoList", "cargoPw", "userIndex" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CargoOwner {

    /** 전역 login_id와 동일 값 (PK) */
    @Id
    @EqualsAndHashCode.Include
    @Column(name = "cargo_id", length = 50, nullable = false)
    private String cargoId; // 문자열 PK (로그인 ID)

    /** user_index.login_id 와 읽기 전용 연결 */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "cargo_id",
        referencedColumnName = "login_id",
        insertable = false,
        updatable = false
    )
    private UserIndex userIndex;

    /** 반드시 해시 저장(BCrypt) */
    @Column(name = "cargo_pw", nullable = false, length = 200)
    private String cargoPw;

    @Column(name = "cargo_email", nullable = false, length = 120)
    private String cargoEmail;

    @Column(name = "cargo_name", nullable = false, length = 60)
    private String cargoName;

    @Column(name = "cargo_phone", length = 30)
    private String cargoPhone;

    @Column(name = "cargo_address", length = 255)
    private String cargoAddress;

    /** 생성 시각 (NOT NULL) */
    @Column(name = "cargo_created_date_time", nullable = false)
    private LocalDateTime cargoCreatedDateTime;

    @Column(name = "profile_image", length = 255)
    private String profileImage;

    /**
     * 소셜 가입 여부 캐시(옵션) — 화면 빠른 표시용
     * - primitive(boolean) → 래퍼(Boolean)로 변경
     * - nullable=false로 신규 NULL 방지
     * - Builder 기본값 보존을 위해 @Builder.Default 사용
     */
    @Builder.Default
    @Column(name = "social", nullable = false)
    private Boolean social = Boolean.FALSE;

    @OneToMany(mappedBy = "cargoOwner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Cargo> cargoList = new ArrayList<>();

    // ===== 생성/업데이트 시 기본값 방어 =====
    @PrePersist
    protected void onCreate() {
        if (cargoCreatedDateTime == null) {
            cargoCreatedDateTime = LocalDateTime.now();
        }
        if (social == null) {
            social = Boolean.FALSE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (social == null) {
            social = Boolean.FALSE;
        }
    }
}
