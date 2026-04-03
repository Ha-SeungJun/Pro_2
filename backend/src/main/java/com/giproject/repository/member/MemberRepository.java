package com.giproject.repository.member;

import com.giproject.entity.member.Member;
import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {

    // role 타입이 String이 맞는지(예: Enum/별도 엔티티인지) 확인 필요
    @Query("select m from Member m where :role member of m.memberRoleList")
    List<Member> findByRole(@Param("role") String role);

    // 이메일로 조회: Optional 반환
    Optional<Member> findFirstByMemEmail(String memEmail);

    // ✅ 존재 여부: boolean 반환 (수정 포인트)
    boolean existsByMemEmail(String memEmail);

    // 아이디로 조회
    Optional<Member> findByMemId(String memId);
    
    Optional<Member> findByMemEmail(String memEmail);

    List<Member> findByMemNameContainingIgnoreCase(String memName);
    

    // 검색
    List<Member> findByMemIdContainingOrMemNameContaining(String memIdKeyword, String memNameKeyword);

    List<Member> findByMemNameContainingIgnoreCaseOrMemEmailContainingIgnoreCaseOrMemPhoneContainingIgnoreCase(String memName, String memEmail, String memPhone);
    // 일반 로그인 (memId 기반) — 존재 가정 시 사용
    @EntityGraph(attributePaths = { "memberRoleList" })
    @Query("SELECT m FROM Member m WHERE m.memId = :memId")
    Member getWithRoles(@Param("memId") String memId);

    // 소셜 로그인 (email 기반)
    @EntityGraph(attributePaths = { "memberRoleList" })
    @Query("SELECT m FROM Member m WHERE m.memEmail = :memEmail")
    Optional<Member> getWithRolesByEmail(@Param("memEmail") String memEmail);

    long countByMemCreateIdDateTimeAfter(LocalDateTime date);

    @Query("SELECT FUNCTION('DATE_FORMAT', m.memCreateIdDateTime, '%Y-%m'), COUNT(m) FROM Member m GROUP BY FUNCTION('DATE_FORMAT', m.memCreateIdDateTime, '%Y-%m')")
    List<Object[]> findNewMembersByMonth();
}
