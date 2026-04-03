package com.giproject.service.qaboard;

import org.springframework.stereotype.Service;

import com.giproject.dto.qaboard.AdminResponseDTO;
import com.giproject.entity.qaboard.AdminResponse;
import com.giproject.entity.qaboard.QAPost;
import com.giproject.repository.qaboard.AdminResponseRepository;
import com.giproject.repository.qaboard.QAPostRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * AdminResponseService 구현체
 * 
 * 관리자 답변 관련 비즈니스 로직 처리
 * - 관리자 권한 검증
 * - 답변 CRUD 작업
 * - Entity ↔ DTO 변환
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class AdminResponseServiceImpl implements AdminResponseService {

    private final AdminResponseRepository adminResponseRepository;
    private final QAPostRepository qaPostRepository;
    
    @Transactional
    @Override
    public AdminResponseDTO createResponse(Long postId, AdminResponseDTO.CreateRequest createRequest, 
                                          String adminId, String adminName) {
        log.info("Creating admin response for post: {} by admin: {}", postId, adminId);
        
        // URL 인코딩된 관리자명 디코딩 처리
        try {
            adminName = java.net.URLDecoder.decode(adminName, "UTF-8");
        } catch (Exception e) {
            log.warn("Failed to decode admin name: {}", adminName);
        }
        
        // 게시글 존재 확인
        QAPost qaPost = qaPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 이미 답변이 있는지 확인 - 더 구체적인 에러 메시지와 함께
        if (adminResponseRepository.existsByQaPostPostId(postId)) {
            log.warn("Attempt to create duplicate response for post: {} by admin: {}", postId, adminId);
            throw new IllegalStateException("해당 게시글에는 이미 답변이 존재합니다. 기존 답변을 수정하거나 삭제 후 다시 작성해주세요.");
        }
        
        // 답변 엔티티 생성
        AdminResponse adminResponse = AdminResponse.builder()
                .qaPost(qaPost)
                .content(createRequest.getContent())
                .adminId(adminId)
                .adminName(adminName)
                .build();
        
        // 저장
        AdminResponse savedResponse = adminResponseRepository.save(adminResponse);
        log.info("Admin response created successfully with ID: {}", savedResponse.getResponseId());
        
        return convertToDTO(savedResponse);
    }
    @Override
    @Transactional(readOnly = true)
    public AdminResponseDTO getResponse(Long postId) {
        log.debug("Getting admin response for post: {}", postId);
        
        AdminResponse adminResponse = adminResponseRepository.findByQaPostPostId(postId)
                .orElse(null);
        
        return adminResponse != null ? convertToDTO(adminResponse) : null;
    }
    @Transactional
    @Override
    public AdminResponseDTO updateResponse(Long postId, AdminResponseDTO.UpdateRequest updateRequest, String adminId) {
        log.info("Updating admin response for post: {} by admin: {}", postId, adminId);
        
        // 답변 조회
        AdminResponse adminResponse = adminResponseRepository.findByQaPostPostId(postId)
                .orElseThrow(() -> new IllegalArgumentException("답변을 찾을 수 없습니다."));
        
        // 관리자는 모든 답변 수정 가능 (권한 검증은 Controller에서 처리)
        
        // 답변 내용 수정
        adminResponse.updateContent(updateRequest.getContent());
        
        // 저장
        AdminResponse updatedResponse = adminResponseRepository.save(adminResponse);
        log.info("Admin response updated successfully: {}", updatedResponse.getResponseId());
        
        return convertToDTO(updatedResponse);
    }
    @Transactional
    @Override
    public void deleteResponse(Long postId, String adminId) {
        log.info("Deleting admin response for post: {} by admin: {}", postId, adminId);
        
        // 답변 조회
        AdminResponse adminResponse = adminResponseRepository.findByQaPostPostId(postId)
                .orElseThrow(() -> new IllegalArgumentException("답변을 찾을 수 없습니다."));
        
        // 관리자는 모든 답변 삭제 가능 (권한 검증은 Controller에서 처리)
        
        // 삭제
        adminResponseRepository.delete(adminResponse);
        log.info("Admin response deleted successfully for post: {}", postId);
    }
    @Override
    @Transactional(readOnly = true)
    public boolean hasResponse(Long postId) {
        return adminResponseRepository.existsByQaPostPostId(postId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasResponsePermission(Long responseId, String adminId) {
        // 관리자는 모든 답변에 대한 권한을 가짐
        // 실제 구현에서는 관리자 역할 검증이 Controller나 Security 레벨에서 처리됨
        return adminResponseRepository.existsById(responseId);
    }

    /**
     * AdminResponse 엔티티를 AdminResponseDTO로 변환
     */
    private AdminResponseDTO convertToDTO(AdminResponse adminResponse) {
        return AdminResponseDTO.builder()
                .responseId(adminResponse.getResponseId())
                .content(adminResponse.getContent())
                .adminId(adminResponse.getAdminId())
                .adminName(adminResponse.getAdminName())
                .createdAt(adminResponse.getCreatedAt())
                .updatedAt(adminResponse.getUpdatedAt())
                .build();
    }
}