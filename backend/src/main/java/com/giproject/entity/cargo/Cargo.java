package com.giproject.entity.cargo;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "cargo") // ← 테이블 이름도 소문자 + 언더바
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cargo_no") // ← PK 컬럼 매핑
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
    
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "cargo_id") // FK는 cargo_owner 테이블의 PK 컬럼명과 일치해야 함
    private CargoOwner cargoOwner;
}