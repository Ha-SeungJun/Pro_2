package com.giproject.repository.qna;

import java.time.LocalDateTime;

public interface MyInquiryRow {
    Long getPostId();
    String getTitle();
    LocalDateTime getCreatedAt();
    Integer getAnswered();
}