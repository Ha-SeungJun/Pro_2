package com.giproject.dto.review;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class ReviewModifyRequest {
    private BigDecimal rating;
    private String comment;
    private List<Long> deleteImageIds;
    private List<MultipartFile> newImages;
}