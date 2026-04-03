package com.giproject.service.qaboard;

import com.giproject.dto.qaboard.AdminResponseDTO;

/**
 * 관리자 답변 서비스 인터페이스
 * 
 * 관리자만 접근 가능한 답변 관리 기능
 * - 답변 작성, 수정, 삭제
 * - 관리자 권한 검증
 */
public interface AdminResponseService {

    /**
     * 관리자 답변 작성
     * @param postId 게시글 ID
     * @param createRequest 답변 작성 요청 데이터
     * @param adminId 관리자 ID
     * @param adminName 관리자 이름
     * @return 생성된 답변 정보
     */
    AdminResponseDTO createResponse(Long postId, AdminResponseDTO.CreateRequest createRequest, 
                                   String adminId, String adminName);

    /**
     * 관리자 답변 조회
     * @param postId 게시글 ID
     * @return 답변 정보 (없으면 null)
     */
    AdminResponseDTO getResponse(Long postId);

    /**
     * 관리자 답변 수정
     * @param postId 게시글 ID
     * @param updateRequest 답변 수정 요청 데이터
     * @param adminId 현재 관리자 ID
     * @return 수정된 답변 정보
     */
    AdminResponseDTO updateResponse(Long postId, AdminResponseDTO.UpdateRequest updateRequest, String adminId);

    /**
     * 관리자 답변 삭제
     * @param postId 게시글 ID
     * @param adminId 현재 관리자 ID
     */
    void deleteResponse(Long postId, String adminId);

    /**
     * 답변 존재 여부 확인
     * @param postId 게시글 ID
     * @return 답변이 있으면 true
     */
    boolean hasResponse(Long postId);

    /**
     * 답변 수정/삭제 권한 확인
     * @param responseId 답변 ID
     * @param adminId 현재 관리자 ID
     * @return 권한이 있으면 true (관리자는 모든 답변 수정/삭제 가능)
     */
    boolean hasResponsePermission(Long responseId, String adminId);
}