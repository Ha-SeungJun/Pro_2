package com.giproject.entity.cargo;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "cargo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder // 데이터 등록 편의를 위해 추가
public class Cargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cargo_no")
    private Integer cargoNo;

    @Column(name = "cargo_name")
    private String cargoName;      // 차량 이름

    @Column(name = "cargo_type")
    private String cargoType;      // 차량 종류

    @Column(name = "cargo_capacity")
    private String cargoCapacity;  // 적재 무게

    @Column(name = "cargo_created_datetime")
    private LocalDateTime cargoCreateidDateTime = LocalDateTime.now();
    
    @Column(name = "cargo_image")
    private String cargoImage;
    
    //  차량 번호 (관리자 승인을 위한 필수 정보)
    @Column(name = "cargo_number", nullable = false) 
    private String cargoNumber;

    // 상태 관리
    @Column(name = "cargo_status")
    @Builder.Default
    private String status = "PENDING"; // "PENDING"(대기중), "APPROVED"(승인), "REJECTED"(거절) 직접 문자열 입력

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "cargo_id")
    private CargoOwner cargoOwner;

    //  상태 변경을 쉽게 하기 위한 편의 메소드
    public void approve() {
        this.status = "APPROVED";
    }

    public void reject() {
        this.status = "REJECTED";
    }
}