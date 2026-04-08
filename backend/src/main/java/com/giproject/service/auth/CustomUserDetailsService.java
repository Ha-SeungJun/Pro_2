package com.giproject.service.auth;

import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Log4j2
public class CustomUserDetailsService implements UserDetailsService {

    private final UserIndexRepository userIndexRepo;
    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserIndex idx = userIndexRepo.findByLoginId(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // ===== 정지 만료 자동 해제 =====
        if (idx.isSuspensionExpired()) {
            idx.clearSuspend();
            userIndexRepo.save(idx);
        }

        // ===== 현재 정지 중이면 로그인 차단 =====
        if (idx.isCurrentlySuspended()) {
            throw new LockedException(buildSuspendMessage(idx));
        }

        if (idx.getRole() == UserIndex.Role.SHIPPER) {
            Member m = memberRepository.findByMemId(username)
                    .orElseThrow(() -> new UsernameNotFoundException("화주 정보 없음: " + username));
            return MemberDTO.fromMember(m);
        } else if (idx.getRole() == UserIndex.Role.DRIVER) {
            CargoOwner c = cargoOwnerRepository.findByCargoId(username)
                    .orElseThrow(() -> new UsernameNotFoundException("차주 정보 없음: " + username));
            return CargoOwnerDTO.fromCargoOwner(c);
        } else if (idx.getRole() == UserIndex.Role.ADMIN) {
            Member m = memberRepository.findByMemId(username)
                    .orElseThrow(() -> new UsernameNotFoundException("관리자 정보 없음: " + username));
            return MemberDTO.fromMember(m);
        }

        throw new UsernameNotFoundException("알 수 없는 역할: " + idx.getRole());
    }

    private String buildSuspendMessage(UserIndex idx) {
        if (idx.isPermanentSuspension()) {
            return "영구정지된 계정입니다."
                    + appendReason(idx.getSuspendReason());
        }

        String endAt = idx.getSuspendEndAt() == null
                ? "-"
                : idx.getSuspendEndAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        return "정지된 계정입니다. \n해제 예정 시각: " + endAt
                + appendReason(idx.getSuspendReason());
    }

    private String appendReason(String reason) {
        if (reason == null || reason.isBlank()) {
            return "";
        }
        return " \n사유: " + reason;
    }
}