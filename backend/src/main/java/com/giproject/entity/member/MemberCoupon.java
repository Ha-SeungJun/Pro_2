package com.giproject.entity.member;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.giproject.entity.Coupon;
import com.giproject.entity.member.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_coupon")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"member", "coupon"})
public class MemberCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mcno;
    
//    쿠폰 소유자
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_id")
    private Member member;

    // 쿠폰 종류
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cno")
    private Coupon coupon;

    @Builder.Default
    private boolean isUsed = false;    // 사용 여부

    private LocalDateTime expiryDate;  // 만료 일시
    private LocalDateTime usedDate;    // 실제 사용 일시
    public void changeUsed(boolean used) {
        this.isUsed = used;
        if (used) {
            this.usedDate = LocalDateTime.now(); // 사용한 시점의 시간 기록
        } else {
            this.usedDate = null;
        }
    }
}