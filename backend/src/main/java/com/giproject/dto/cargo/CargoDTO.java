package com.giproject.dto.cargo;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CargoDTO {
    private String name;    // 차량 이름
    private String address; // 차량 종류
    private String weight;  // 적재 무게 
    private String image; // 이미지 경로
}