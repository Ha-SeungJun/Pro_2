package com.giproject.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.giproject.entity.account.UserIndex;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.fees.FeesBasic;
import com.giproject.entity.fees.FeesExtra;
import com.giproject.entity.member.Member;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.fees.FeesBasicRepository;
import com.giproject.repository.fees.FeesExtraRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.noboard.NoticeRepository;
import com.giproject.repository.qaboard.QAPostRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    // 1. [필드 선언부] 사라졌던 모든 의존성을 다시 복구합니다.
    private final UserIndexRepository userIndexRepository;
    private final QAPostRepository qaPostRepository;
    private final NoticeRepository noticeRepository;
    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;
    private final FeesBasicRepository feesBasicRepository;
    private final FeesExtraRepository feesExtraRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        // 2. [로직 실행부] A와 B의 모든 더미 데이터 생성을 차례대로 수행합니다.
        
        // QAPost & Notice (B의 작업분)
        if (qaPostRepository.count() == 0) { createQAPostDummyData(); }
        if (noticeRepository.count() == 0) { createNoticeDummyData(); }

        // 관리자 계정 생성 (A의 작업분)
        if (!memberRepository.existsByMemEmail("admin@admin.com")) {
            UserIndex adminIndex = UserIndex.builder()
                .loginId("admin").email("admin@admin.com").role(UserIndex.Role.ADMIN).build();
            userIndexRepository.save(adminIndex);

            Member admin = Member.builder()
                .memId("admin").memEmail("admin@admin.com")
                .memPw(passwordEncoder.encode("qwer1234@")).memName("관리자").memPhone("010-0000-0000").build();
            admin.addRole("ADMIN");
            memberRepository.save(admin);
        }

        // 화물주 계정 생성 (A의 작업분)
        if (!memberRepository.existsByMemEmail("test1@test.com")) {
            UserIndex shipperIndex = UserIndex.builder()
                .loginId("test1").email("test1@test.com").role(UserIndex.Role.SHIPPER).build();
            userIndexRepository.save(shipperIndex);

            Member shipper = Member.builder()
                .memId("test1").memEmail("test1@test.com")
                .memPw(passwordEncoder.encode("qwer1234@")).memName("테스트화물주").memPhone("010-1111-1111").build();
            shipper.addRole("USER");
            memberRepository.save(shipper);
        }

        // 차주 계정 생성 (A의 작업분)
        if (!cargoOwnerRepository.existsById("test2")) {
            if (!userIndexRepository.existsById("test2")) {
                userIndexRepository.save(UserIndex.builder().loginId("test2").email("test2@test.com").role(UserIndex.Role.DRIVER).build());
            }
            cargoOwnerRepository.save(CargoOwner.builder()
                .cargoId("test2").cargoEmail("test2@test.com").cargoPw(passwordEncoder.encode("qwer1234@"))
                .cargoName("테스트차주").cargoPhone("010-2222-2222").cargoAddress("서울시 테스트구").social(false).build());
        }
        
        // 요금 데이터 생성 (A의 작업분)
        if (feesBasicRepository.count() == 0) {
            Object[][] data = {
                {"다마스", "0.5톤", 5L, "/uploads/cargo/damas.jpg"},
                {"라보", "1톤", 10L, "/uploads/cargo/labo.jpg"},
                {"1톤카고", "2톤", 20L, "/uploads/cargo/1ton_cargo.jpg"},
            };
            for (Object[] row : data) {
                feesBasicRepository.save(FeesBasic.builder().cargoName((String) row[0]).weight((String) row[1])
                    .ratePerKm(BigDecimal.valueOf((Long) row[2])).initialCharge(BigDecimal.ZERO)
                    .cargoImage((String) row[3]).updatedAt(LocalDateTime.now()).build());
            }
        }

        if (feesExtraRepository.count() == 0) {
            String[] extras = {"야간 할증", "휴일 할증", "긴급 배송", "상하차료", "대기료"};
            for (String title : extras) {
                feesExtraRepository.save(FeesExtra.builder().extraChargeTitle(title).extraCharge(BigDecimal.ZERO).updatedAt(LocalDateTime.now()).build());
            }
        }
    }
    
    // (createQAPostDummyData, createNoticeDummyData 메서드는 하단에 그대로 유지)
}