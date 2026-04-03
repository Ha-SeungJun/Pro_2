// com.giproject.entity.member.Member
package com.giproject.entity.member;

import com.giproject.entity.account.UserIndex;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = { "memberRoleList", "memPw", "userIndex" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Member {

    /** 전역 login_id와 동일 값 (PK) */
    @Id
    @EqualsAndHashCode.Include
    @Column(name = "mem_id", length = 50, nullable = false)
    private String memId; // 문자열 PK (로그인 ID)

    /** user_index.login_id 와 읽기 전용 연결 */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_id", referencedColumnName = "login_id",
            insertable = false, updatable = false)
    private UserIndex userIndex;

    @Column(name = "mem_email", unique = true, nullable = false, length = 120)
    private String memEmail;

    /** 반드시 해시 저장(BCrypt) */
    @Column(name = "mem_pw", nullable = false, length = 200)
    private String memPw;

    @Column(name = "mem_name", nullable = false, length = 60)
    private String memName;

    @Column(name = "mem_phone", length = 30)
    private String memPhone;

    @Column(name = "mem_address", length = 255)
    private String memAddress;

    @Column(name = "profile_image")
    private String profileImage;

    /** 생성 시각 (NOT NULL) */
    @Column(name = "mem_create_id_datetime", nullable = false)
    private LocalDateTime memCreateIdDateTime;

    /** 세부 권한이 필요하면 유지, 전역 역할은 user_index.role 사용 */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "member_roles", joinColumns = @JoinColumn(name = "mem_id"))
    @Column(name = "role", length = 30)
    @Builder.Default
    private List<String> memberRoleList = new ArrayList<>();

    /** 소셜 가입 여부 캐시(옵션) */
    @Column(name = "social")
    private boolean social;

    // ===== 권한 편의 메서드 =====
    public void addRole(String role) {
        if (role == null) return;
        if (!this.memberRoleList.contains(role)) this.memberRoleList.add(role);
    }

    public void clearRole() {
        this.memberRoleList.clear();
    }

    // ===== 정보 수정 메서드 =====
    public void changeMemPw(String memPw) { this.memPw = memPw; }
    public void changeMemAddress(String memAddress) { this.memAddress = memAddress; }
    public void changeMemPhone(String memPhone) { this.memPhone = memPhone; }

    // ===== 생성시각 자동 세팅 =====
    @PrePersist
    protected void onCreate() {
        if (memCreateIdDateTime == null) {
            memCreateIdDateTime = LocalDateTime.now();
        }
    }
}
