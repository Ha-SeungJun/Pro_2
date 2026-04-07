package com.giproject.service.admin;

import com.giproject.dto.admin.UserSuspendDTO;
import com.giproject.entity.account.SuspendPeriod;
import com.giproject.entity.account.UserIndex;
import com.giproject.repository.account.UserIndexRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminSanctionServiceImpl implements AdminSanctionService {

    private final UserIndexRepository userIndexRepository;

    @Override
    public UserSuspendDTO.SuspendResponse suspendUser(String loginId, UserSuspendDTO.SuspendRequest request) {
        if (request == null || request.getPeriod() == null) {
            throw new IllegalArgumentException("정지 기간은 필수입니다.");
        }

        UserIndex user = userIndexRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("대상 사용자가 존재하지 않습니다."));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endAt = resolveSuspendEnd(now, request.getPeriod());

        user.suspend(now, endAt, request.getReason());

        return UserSuspendDTO.SuspendResponse.builder()
                .loginId(user.getLoginId())
                .suspended(user.getSuspended())
                .suspendStartAt(user.getSuspendStartAt())
                .suspendEndAt(user.getSuspendEndAt())
                .suspendReason(user.getSuspendReason())
                .message(buildSuspendMessage(user.getLoginId(), request.getPeriod()))
                .build();
    }

    @Override
    public UserSuspendDTO.SuspendResponse unsuspendUser(String loginId) {
        UserIndex user = userIndexRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("대상 사용자가 존재하지 않습니다."));

        user.clearSuspend();

        return UserSuspendDTO.SuspendResponse.builder()
                .loginId(user.getLoginId())
                .suspended(user.getSuspended())
                .suspendStartAt(user.getSuspendStartAt())
                .suspendEndAt(user.getSuspendEndAt())
                .suspendReason(user.getSuspendReason())
                .message("정지가 해제되었습니다.")
                .build();
    }

    private LocalDateTime resolveSuspendEnd(LocalDateTime now, SuspendPeriod period) {
        return switch (period) {
            case WEEK -> now.plusDays(7);
            case MONTH -> now.plusDays(30);
            case YEAR -> now.plusYears(1);
            case PERMANENT -> null;
        };
    }

    private String buildSuspendMessage(String loginId, SuspendPeriod period) {
        return switch (period) {
            case WEEK -> loginId + " 계정이 7일 정지되었습니다.";
            case MONTH -> loginId + " 계정이 30일 정지되었습니다.";
            case YEAR -> loginId + " 계정이 1년 정지되었습니다.";
            case PERMANENT -> loginId + " 계정이 영구정지되었습니다.";
        };
    }
}