package com.giproject.entity.noboard;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.giproject.enums.NoticeCategory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * 공지사항 게시글 엔티티
 * 
 * 관리자만 작성/수정/삭제 가능
 */
@Entity
@Table(name = "notice")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long noticeId; // 공지사항 고유 식별자
    
    @Column(nullable = false, length = 200)
    private String title; // 공지사항 제목
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // 공지사항 내용
    
    @Column(name = "author_id", nullable = false, length = 50)
    private String authorId; // 작성자 ID (관리자 ID)
    
    @Column(name = "author_name", nullable = false, length = 100)
    private String authorName; // 작성자 이름 (표시용)
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 작성일시
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 수정일시
    
    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0; // 조회수
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private NoticeCategory category = NoticeCategory.GENERAL; // 공지사항 카테고리
    
    /**
     * 공지사항 정보 수정
     */
    public void updateNotice(String title, String content) {
        this.title = title;
        this.content = content;
    }
    
    /**
     * 공지사항 정보 수정 (작성자명 포함)
     */
    public void updateNotice(String title, String content, String authorName) {
        this.title = title;
        this.content = content;
        this.authorName = authorName;
    }
    
    /**
     * 공지사항 정보 수정 (카테고리 포함)
     */
    public void updateNotice(String title, String content, String authorName, NoticeCategory category) {
        this.title = title;
        this.content = content;
        this.authorName = authorName;
        this.category = category;
    }
    
    /**
     * 조회수 증가
     */
    public void incrementViewCount() {
        this.viewCount++;
    }
}