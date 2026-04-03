package com.giproject.service.noboard;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.giproject.dto.noboard.NoticeDTO;
import com.giproject.dto.noboard.NoticePageResponseDTO;
import com.giproject.entity.noboard.Notice;
import com.giproject.enums.NoticeCategory;

import jakarta.transaction.Transactional;

/**
 * Notice 서비스 인터페이스
 * 
 * 공지사항의 모든 비즈니스 로직을 담당
 * - 게시글 CRUD 작업
 * - 권한 기반 접근 제어 (관리자만 작성/수정/삭제)
 * - 페이지네이션 및 검색
 * - Entity ↔ DTO 변환
 */
@Transactional
public interface NoticeService {

    /**
     * 공지사항 작성
     * @param createRequest 공지사항 작성 요청 데이터
     * @param authorId 작성자 ID (관리자)
     * @param authorName 작성자 이름 (관리자)
     * @return 생성된 공지사항 정보
     */
    NoticeDTO createNotice(NoticeDTO.CreateRequest createRequest, String authorId, String authorName);

    /**
     * 공지사항 목록 조회
     * @param keyword 검색어 (null이면 검색 안함)
     * @param category 카테고리 (null이면 전체)
     * @param pageable 페이지네이션 정보
     * @return 페이지네이션된 공지사항 목록
     */
    NoticePageResponseDTO<NoticeDTO.ListResponse> getNoticeList(String keyword, NoticeCategory category, Pageable pageable);

    /**
     * 공지사항 상세 조회
     * @param noticeId 공지사항 ID
     * @return 공지사항 상세 정보
     */
    NoticeDTO getNoticeDetail(Long noticeId);

    /**
     * 공지사항 수정
     * @param noticeId 공지사항 ID
     * @param updateRequest 수정 요청 데이터
     * @param currentUserId 현재 사용자 ID
     * @param authorName 작성자 이름
     * @param isAdmin 관리자 권한 여부
     * @return 수정된 공지사항 정보
     */
    NoticeDTO updateNotice(Long noticeId, NoticeDTO.UpdateRequest updateRequest, String currentUserId, String authorName, boolean isAdmin);

    /**
     * 공지사항 삭제
     * @param noticeId 공지사항 ID
     * @param currentUserId 현재 사용자 ID
     * @param isAdmin 관리자 권한 여부
     */
    void deleteNotice(Long noticeId, String currentUserId, boolean isAdmin);

    /**
     * 공지사항 조회수 증가
     * @param noticeId 공지사항 ID
     */
    void incrementViewCount(Long noticeId);
}