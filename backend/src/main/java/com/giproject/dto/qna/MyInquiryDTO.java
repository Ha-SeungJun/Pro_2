package com.giproject.dto.qna;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data @AllArgsConstructor
public class MyInquiryDTO {
    private Long postId;
    private String title;
    private LocalDateTime createdAt;
    private boolean answered;
}