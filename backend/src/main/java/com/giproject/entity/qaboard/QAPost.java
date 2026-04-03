package com.giproject.entity.qaboard;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * QA게시판 게시글 엔티티
 * 
 * 카테고리 매핑:
 * - GENERAL: 일반문의
 * - TECHNICAL: 기술지원  
 * - BILLING: 결제/요금
 * - SERVICE: 서비스이용
 * - ETC: 기타
 * 
 * 작성자 연동:
 * - authorId: 실제 사용자 ID (memId, cargoId, admin)
 * - authorName: 표시용 작성자 이름 (Member/Cargo/Admin 테이블에서 조회)
 * - authorType: 사용자 유형 구분 (MEMBER, CARGO, ADMIN)
 * 
 * 권한 체계:
 * - MEMBER/CARGO: 본인 게시글만 수정/삭제 가능
 * - ADMIN: 모든 게시글 수정/삭제, 답변 작성 가능
 */
@Entity
@Table(name = "qa_post")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QAPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long postId; // 게시글 고유 식별자
    
    @Column(nullable = false, length = 200)
    private String title; // 게시글 제목
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // 게시글 내용
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QACategory category; // 카테고리
    
    @Builder.Default
    @Column(name = "is_private", nullable = false)
    private Boolean isPrivate = false; // 비공개 여부
    
    @Column(name = "author_id", nullable = false, length = 50)
    private String authorId; // 작성자 ID (Member 테이블의 memId와 연동)
    
    @Column(name = "author_name", nullable = false, length = 100)
    private String authorName; // 작성자 이름 (표시용)
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "author_type", nullable = false, length = 20)
    private AuthorType authorType = AuthorType.MEMBER; // 작성자 유형 (MEMBER, CARGO, ADMIN)
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 작성일시
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 수정일시
    
    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0; // 조회수
    
    /**
     * 게시글 정보 수정
     */
    public void updatePost(String title, String content, QACategory category, Boolean isPrivate) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.isPrivate = isPrivate;
    }
    
    /**
     * 조회수 증가
     */
    public void incrementViewCount() {
        this.viewCount++;
    }
    
    /**
     * 작성자 여부 확인
     */
    public boolean isAuthor(String userId) {
        return this.authorId != null && this.authorId.equals(userId);
    }
    
    /**
     * 게시글 수정 권한 확인
     * 
     * @param currentUserId 현재 사용자 ID
     * @param currentUserType 현재 사용자 유형
     * @return 수정 권한 여부
     */
    public boolean canModify(String currentUserId, AuthorType currentUserType) {
        return currentUserType.canModifyPost(this.authorId, currentUserId);
    }
    
    /**
     * 게시글 삭제 권한 확인
     * 
     * @param currentUserId 현재 사용자 ID
     * @param currentUserType 현재 사용자 유형
     * @return 삭제 권한 여부
     */
    public boolean canDelete(String currentUserId, AuthorType currentUserType) {
        return currentUserType.canDeletePost(this.authorId, currentUserId);
    }
    
    /**
     * 비공개 게시글 조회 권한 확인
     * 
     * @param currentUserId 현재 사용자 ID
     * @param currentUserType 현재 사용자 유형
     * @return 조회 권한 여부
     */
    public boolean canView(String currentUserId, AuthorType currentUserType) {
        // 공개 게시글은 모든 사용자 조회 가능
        if (this.isPublic()) {
            return true;
        }
        
        // 비공개 게시글은 권한 체크
        return currentUserType.canViewPrivatePost(this.authorId, currentUserId);
    }
    
    /**
     * 관리자 여부 확인
     * 
     * @return 작성자가 관리자인지 여부
     */
    public boolean isAuthorAdmin() {
        return this.authorType.isAdmin();
    }
    
    // AdminResponse와의 1:1 관계 매핑
    @OneToOne(mappedBy = "qaPost", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private AdminResponse adminResponse;
    
    /**
     * 공개 게시글 여부 확인
     */
    public boolean isPublic() {
        return !this.isPrivate;
    }
    
    /**
     * 관리자 답변 여부 확인
     */
    public boolean hasAdminResponse() {
        return this.adminResponse != null;
    }
}