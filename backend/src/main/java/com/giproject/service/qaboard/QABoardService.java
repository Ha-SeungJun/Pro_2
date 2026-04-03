package com.giproject.service.qaboard;

import org.springframework.data.domain.Pageable;

import com.giproject.dto.qaboard.QAPostDTO;
import com.giproject.dto.qaboard.PageResponseDTO;
import com.giproject.entity.qaboard.QACategory;

/**
 * QABoard 서비스 인터페이스
 * 
 * QA게시판의 모든 비즈니스 로직을 담당
 * - 게시글 CRUD 작업
 * - 권한 기반 접근 제어
 * - 페이지네이션 및 검색
 * - Entity ↔ DTO 변환
 */
public interface QABoardService {

    /**
     * 게시글 작성
     * @param createRequest 게시글 작성 요청 데이터
     * @param authorId 작성자 ID
     * @param authorName 작성자 이름
     * @return 생성된 게시글 정보
     */
    QAPostDTO createPost(QAPostDTO.CreateRequest createRequest, String authorId, String authorName);

    /**
     * 게시글 목록 조회 (권한별)
     * @param category 카테고리 필터 (null이면 전체)
     * @param keyword 검색어 (null이면 검색 안함)
     * @param pageable 페이지네이션 정보
     * @param isAdmin 관리자 여부
     * @param currentUserId 현재 사용자 ID (비공개 게시글 조회용)
     * @return 페이지네이션된 게시글 목록
     */
    PageResponseDTO<QAPostDTO.ListResponse> getPostList(
        String category, String keyword, Pageable pageable, boolean isAdmin, String currentUserId
    );

    /**
     * 게시글 상세 조회
     * @param postId 게시글 ID
     * @param currentUserId 현재 사용자 ID (null 가능)
     * @param isAdmin 관리자 여부
     * @return 게시글 상세 정보
     */
    QAPostDTO getPostDetail(Long postId, String currentUserId, boolean isAdmin);

    /**
     * 게시글 수정
     * @param postId 게시글 ID
     * @param updateRequest 수정 요청 데이터
     * @param currentUserId 현재 사용자 ID
     * @param isAdmin 관리자 여부
     * @return 수정된 게시글 정보
     */
    QAPostDTO updatePost(Long postId, QAPostDTO.UpdateRequest updateRequest, 
                        String currentUserId, boolean isAdmin);

    /**
     * 게시글 삭제
     * @param postId 게시글 ID
     * @param currentUserId 현재 사용자 ID
     * @param isAdmin 관리자 여부
     */
    void deletePost(Long postId, String currentUserId, boolean isAdmin);

    /**
     * 내가 작성한 게시글 조회 (마이페이지용)
     * @param authorId 작성자 ID
     * @param pageable 페이지네이션 정보
     * @return 내 게시글 목록
     */
    PageResponseDTO<QAPostDTO.ListResponse> getMyPosts(String authorId, Pageable pageable);

    /**
     * 게시글 조회수 증가
     * @param postId 게시글 ID
     */
    void incrementViewCount(Long postId);

    /**
     * 게시글 수정/삭제 권한 확인
     * @param postId 게시글 ID
     * @param currentUserId 현재 사용자 ID
     * @param isAdmin 관리자 여부
     * @return 권한 있으면 true
     */
    boolean hasPostPermission(Long postId, String currentUserId, boolean isAdmin);

    /**
     * 게시글 조회 권한 확인 (비공개 게시글 처리)
     * @param postId 게시글 ID
     * @param currentUserId 현재 사용자 ID
     * @param isAdmin 관리자 여부
     * @return 조회 가능하면 true
     */
    boolean canViewPost(Long postId, String currentUserId, boolean isAdmin);

    /**
     * 카테고리 코드를 QACategory enum으로 변환
     * @param categoryCode 카테고리 코드
     * @return QACategory enum (null 가능)
     */
    default QACategory convertCategory(String categoryCode) {
        if (categoryCode == null || categoryCode.equals("all")) {
            return null;
        }
        try {
            return QACategory.fromCode(categoryCode);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}