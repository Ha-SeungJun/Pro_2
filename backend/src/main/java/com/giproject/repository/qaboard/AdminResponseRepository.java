package com.giproject.repository.qaboard;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.entity.qaboard.AdminResponse;

/**
 * AdminResponse 엔티티를 위한 Repository 인터페이스
 * 
 * 관리자 답변 관련 데이터 액세스 기능
 * - 게시글별 답변 조회
 * - 답변 존재 여부 확인
 * - 관리자별 답변 조회
 */
public interface AdminResponseRepository extends JpaRepository<AdminResponse, Long> {

    /**
     * 특정 게시글의 관리자 답변 조회
     * QAPost와 함께 Fetch Join으로 성능 최적화
     */
    @Query("SELECT ar FROM AdminResponse ar " +
           "JOIN FETCH ar.qaPost " +
           "WHERE ar.qaPost.postId = :postId")
    Optional<AdminResponse> findByQaPostPostId(@Param("postId") Long postId);

    /**
     * 특정 게시글에 관리자 답변이 존재하는지 확인
     */
    boolean existsByQaPostPostId(@Param("postId") Long postId);

    /**
     * 특정 관리자가 작성한 답변 개수 조회
     */
    long countByAdminId(@Param("adminId") String adminId);

    /**
     * 게시글 ID로 답변 삭제
     * 게시글 삭제 시 연관된 답변도 함께 삭제하기 위함
     */
    @Modifying
    @Transactional
    void deleteByQaPostPostId(@Param("postId") Long postId);

    /**
     * 특정 답변의 작성자 확인 (권한 검증용)
     */
    @Query("SELECT ar.adminId FROM AdminResponse ar WHERE ar.responseId = :responseId")
    Optional<String> findAdminIdByResponseId(@Param("responseId") Long responseId);

    /**
     * 게시글 ID로 답변 ID 조회
     */
    @Query("SELECT ar.responseId FROM AdminResponse ar WHERE ar.qaPost.postId = :postId")
    Optional<Long> findResponseIdByPostId(@Param("postId") Long postId);
}