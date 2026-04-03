package com.giproject.controller.member;

import com.giproject.dto.common.AddressUpdateRequest;
import com.giproject.dto.common.PasswordChangeRequest;
import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;
import com.giproject.security.AuthzUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/g2i4/member")
@RequiredArgsConstructor
public class MemberMutationController {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @PutMapping("/{id}/address")
    public ResponseEntity<?> updateAddress(@PathVariable("id") String id,
                                           @RequestBody AddressUpdateRequest req,
                                           Authentication auth) {
        AuthzUtil.assertOwnerOrAdmin(auth, id);

        Member m = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));
        m.setMemAddress(req.getAddress());
        // postcode를 저장할 컬럼이 있으면 함께 반영 (예: m.setMemPostcode(req.getPostcode());)
        memberRepository.save(m);
        return ResponseEntity.noContent().build(); // 204
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable("id") String id,
                                            @RequestBody PasswordChangeRequest req,
                                            Authentication auth) {
        AuthzUtil.assertOwnerOrAdmin(auth, id);

        if (req.getCurrentPassword() == null || req.getNewPassword() == null) {
            return ResponseEntity.badRequest().body("비밀번호를 모두 입력하세요.");
        }

        Member m = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), m.getMemPw())) {
            return ResponseEntity.status(400).body("현재 비밀번호가 일치하지 않습니다.");
        }

        m.setMemPw(passwordEncoder.encode(req.getNewPassword()));
        memberRepository.save(m);
        return ResponseEntity.noContent().build();
    }
}