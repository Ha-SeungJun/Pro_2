package com.giproject.repository.noboard;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.noboard.Notice;
import com.giproject.enums.NoticeCategory;

/**
 * Notice 엔티티를 위한 Repository 인터페이스
 * 
 * 공지사항 관련 데이터 액세스 기능
 * - 페이지네이션 지원
 * - 검색 기능 (제목, 내용)
 */
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    /**
     * 모든 공지사항 목록 조회 (최신순 정렬)
     */
    Page<Notice> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * 제목 또는 내용으로 공지사항 검색 (최신순 정렬)
     */
    @Query("SELECT n FROM Notice n " +
           "WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY n.createdAt DESC")
    Page<Notice> findByTitleContainingOrContentContainingOrderByCreatedAtDesc(
        @Param("keyword") String keyword, 
        Pageable pageable
    );
    
    /**
     * 특정 공지사항의 작성자 ID 조회 (권한 검증용)
     */
    @Query("SELECT n.authorId FROM Notice n WHERE n.noticeId = :noticeId")
    Optional<String> findAuthorIdByNoticeId(@Param("noticeId") Long noticeId);
    
    /**
     * 카테고리별 공지사항 목록 조회 (최신순 정렬)
     */
    Page<Notice> findByCategoryOrderByCreatedAtDesc(NoticeCategory category, Pageable pageable);
    
    /**
     * 카테고리와 키워드로 공지사항 검색 (최신순 정렬)
     */
    @Query("SELECT n FROM Notice n " +
           "WHERE n.category = :category " +
           "AND (LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY n.createdAt DESC")
    Page<Notice> findByCategoryAndTitleContainingOrContentContainingOrderByCreatedAtDesc(
        @Param("category") NoticeCategory category,
        @Param("keyword") String keyword, 
        Pageable pageable
    );
}