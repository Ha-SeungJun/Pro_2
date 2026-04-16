package com.giproject.dto.review;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverDetailDTO {

    private DriverProfileCardDTO profile;
    private List<MyReviewListDTO> reviews;
}