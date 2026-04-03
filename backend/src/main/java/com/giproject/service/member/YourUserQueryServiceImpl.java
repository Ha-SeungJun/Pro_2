package com.giproject.service.member;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class YourUserQueryServiceImpl implements YourUserQueryService {

    private final MemberRepository memberRepository;           // 예: 사용자 테이블 1
    private final CargoOwnerRepository cargoOwnerRepository;   // 예: 사용자 테이블 2

    @Override
    public boolean existsByEmail(String email) {
        if (email == null || email.isBlank()) return false;
        return memberRepository.existsByMemEmail(email)
            || cargoOwnerRepository.existsByCargoEmail(email);
    }
}
