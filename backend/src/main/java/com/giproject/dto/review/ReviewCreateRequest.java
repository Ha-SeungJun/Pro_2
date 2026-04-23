package com.giproject.dto.review;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
//등록 전용 DTO
public class ReviewCreateRequest {
	private Long deliveryNo;
	private BigDecimal rating;
	private String comment;
	private List<MultipartFile> images;
}
