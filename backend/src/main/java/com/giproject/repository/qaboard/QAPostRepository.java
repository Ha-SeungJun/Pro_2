package com.giproject.repository.qaboard;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.qaboard.QACategory;
import com.giproject.entity.qaboard.QAPost;

/**
 * QAPost 엔티티를 위한 Repository 인터페이스
 * 
 * JPA Repository 기본 기능 + 커스텀 쿼리 메서드
 * - 페이지네이션 지원
 * - 카테고리별 필터링
 * - 검색 기능 (제목, 내용)
 * - 작성자별 조회 (마이페이지용)
 * - 권한별 조회 (공개/비공개 처리)
 */
public interface QAPostRepository extends JpaRepository<QAPost, Long> {

    /**
     * 게시글 상세 조회 (AdminResponse와 함께 Fetch Join)
     * N+1 문제 방지를 위한 최적화
     */
    @Query("SELECT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE p.postId = :postId")
    Optional<QAPost> findByIdWithResponse(@Param("postId") Long postId);

    /**
     * 공개 게시글 목록 조회 (일반 사용자용)
     * 비공개 게시글 제외하고 최신순 정렬
     * AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
     */
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE p.isPrivate = false " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> findByIsPrivateFalseOrderByCreatedAtDesc(Pageable pageable);

    /**
     * 모든 게시글 목록 조회 (관리자용)
     * 공개/비공개 구분 없이 최신순 정렬
     * AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
     */
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * 카테고리별 공개 게시글 조회 (일반 사용자용)
     * AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
     */
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE p.category = :category AND p.isPrivate = false " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> findByCategoryAndIsPrivateFalseOrderByCreatedAtDesc(
        @Param("category") QACategory category, 
        Pageable pageable
    );

    /**
     * 카테고리별 모든 게시글 조회 (관리자용)
     * AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
     */
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE p.category = :category " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> findByCategoryOrderByCreatedAtDesc(
        @Param("category") QACategory category, 
        Pageable pageable
    );

    /**
     * 제목/내용 검색 - 공개 게시글만 (일반 사용자용)
     * AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
     */
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE p.isPrivate = false " +
           "AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> searchPublicPosts(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 제목/내용 검색 - 모든 게시글 (관리자용)
     * AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
     */
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> searchAllPosts(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 카테고리 + 검색 조합 - 공개 게시글만 (일반 사용자용)
     * AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
     */
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE p.category = :category " +
           "AND p.isPrivate = false " +
           "AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> searchPublicPostsByCategory(
        @Param("category") QACategory category,
        @Param("keyword") String keyword, 
        Pageable pageable
    );

    /**
     * 카테고리 + 검색 조합 - 모든 게시글 (관리자용)
     * AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
     */
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE p.category = :category " +
           "AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> searchAllPostsByCategory(
        @Param("category") QACategory category,
        @Param("keyword") String keyword, 
        Pageable pageable
    );

    /**
     * 특정 작성자의 게시글 조회 (마이페이지용)
     * 본인이 작성한 게시글 (공개/비공개 모두 포함)
     * AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
     */
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE p.authorId = :authorId " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> findByAuthorIdOrderByCreatedAtDesc(
        @Param("authorId") String authorId, 
        Pageable pageable
    );

    /**
     * 특정 작성자의 공개 게시글만 조회 (다른 사용자가 특정 작성자 글 보기)
     */
    Page<QAPost> findByAuthorIdAndIsPrivateFalseOrderByCreatedAtDesc(
        @Param("authorId") String authorId, 
        Pageable pageable
    );

    /**
     * 게시글 존재 여부 + 작성자 확인 (권한 검증용)
     */
    boolean existsByPostIdAndAuthorId(
        @Param("postId") Long postId, 
        @Param("authorId") String authorId
    );

    /**
     * 게시글이 공개 상태인지 확인
     */
    @Query("SELECT p.isPrivate FROM QAPost p WHERE p.postId = :postId")
    Optional<Boolean> findIsPrivateByPostId(@Param("postId") Long postId);

    /**
     * 특정 게시글의 작성자 ID 조회 (권한 검증용)
     */
    @Query("SELECT p.authorId FROM QAPost p WHERE p.postId = :postId")
    Optional<String> findAuthorIdByPostId(@Param("postId") Long postId);

    // 사용자별 접근 가능한 게시글 검색 (공개 게시글 + 본인 비공개 게시글)
    // AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (p.isPrivate = false OR p.authorId = :userId) " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> searchAccessiblePosts(@Param("keyword") String keyword, @Param("userId") String userId, Pageable pageable);
    
    // 카테고리별 사용자 접근 가능한 게시글 검색
    // AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE p.category = :category " +
           "AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (p.isPrivate = false OR p.authorId = :userId) " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> searchAccessiblePostsByCategory(@Param("category") QACategory category, 
                                                 @Param("keyword") String keyword, 
                                                 @Param("userId") String userId, 
                                                 Pageable pageable);
    
    // 사용자별 접근 가능한 게시글 목록 (카테고리별)
    // AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE p.category = :category " +
           "AND (p.isPrivate = false OR p.authorId = :userId) " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> findAccessiblePostsByCategory(@Param("category") QACategory category, 
                                              @Param("userId") String userId, 
                                              Pageable pageable);
    
    // 사용자별 접근 가능한 전체 게시글 목록
    // AdminResponse와 함께 Fetch Join으로 N+1 문제 해결
    @Query("SELECT DISTINCT p FROM QAPost p " +
           "LEFT JOIN FETCH p.adminResponse " +
           "WHERE (p.isPrivate = false OR p.authorId = :userId) " +
           "ORDER BY p.createdAt DESC")
    Page<QAPost> findAccessiblePosts(@Param("userId") String userId, Pageable pageable);
}