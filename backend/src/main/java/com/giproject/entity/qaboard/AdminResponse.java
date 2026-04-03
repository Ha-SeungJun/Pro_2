package com.giproject.entity.qaboard;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * 관리자 답변 엔티티
 * 
 * QAPost와 1:1 관계로 설계
 * - 하나의 게시글에는 최대 하나의 관리자 답변만 존재
 * - 관리자만 답변 작성/수정/삭제 가능
 * 
 * 관리자 정보:
 * - adminId: 답변 작성한 관리자의 Member ID
 * - adminName: 표시용 관리자 이름
 */
@Entity
@Table(name = "admin_response")
@Getter
@ToString(exclude = "qaPost") // 순환참조 방지
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "response_id")
    private Long responseId; // 답변 고유 식별자
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private QAPost qaPost; // 연관된 게시글
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // 답변 내용
    
    @Column(name = "admin_id", nullable = false, length = 50)
    private String adminId; // 답변 작성 관리자 ID (Member 테이블의 memId와 연동)
    
    @Column(name = "admin_name", nullable = false, length = 100)
    private String adminName; // 답변 작성 관리자 이름 (표시용)
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 답변 작성일시
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 답변 수정일시
    
    /**
     * 답변 내용 수정
     */
    public void updateContent(String content) {
        this.content = content;
    }
    
    /**
     * 답변 작성자 여부 확인
     */
    public boolean isWrittenBy(String adminId) {
        return this.adminId.equals(adminId);
    }
    
    /**
     * 게시글 연관관계 설정
     */
    public void setQaPost(QAPost qaPost) {
        this.qaPost = qaPost;
    }
}