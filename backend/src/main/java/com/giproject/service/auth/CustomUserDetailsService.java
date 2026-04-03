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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Log4j2
public class CustomUserDetailsService implements UserDetailsService {

    private final UserIndexRepository userIndexRepo;
    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // username == 우리 서비스 loginId (memId 또는 cargoId)
        var idx = userIndexRepo.findByLoginId(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        if (idx.getRole() == UserIndex.Role.SHIPPER) {
            Member m = memberRepository.findByMemId(username)
                    .orElseThrow(() -> new UsernameNotFoundException("화주 정보 없음: " + username));
            // MemberDTO에 이미 fromMember(...)가 있어야 합니다 (앞서 추가한 버전)
            return MemberDTO.fromMember(m); // UserDetails
        } else if (idx.getRole() == UserIndex.Role.DRIVER) {
            CargoOwner c = cargoOwnerRepository.findByCargoId(username)
                    .orElseThrow(() -> new UsernameNotFoundException("차주 정보 없음: " + username));
            // CargoOwnerDTO에 fromCargoOwner(...) 오버로드가 있어야 합니다 (앞서 추가한 버전)
            return CargoOwnerDTO.fromCargoOwner(c); // UserDetails
        } else if (idx.getRole() == UserIndex.Role.ADMIN) {
            Member m = memberRepository.findByMemId(username)
                    .orElseThrow(() -> new UsernameNotFoundException("관리자 정보 없음: " + username));
            return MemberDTO.fromMember(m);
        }

        throw new UsernameNotFoundException("알 수 없는 역할: " + idx.getRole());
    }
}