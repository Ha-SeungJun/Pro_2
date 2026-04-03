// com.giproject.dto.DtoConverters
package com.giproject.dto.user;

import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * DTO <-> DTO 수동 변환 유틸리티 (null-safe)
 * - 엔티티 변환이 아니라, 이미 만들어진 DTO들 간 매핑 전용
 * - 비밀번호는 두 DTO 모두 User 상속으로 인해 생성자 전달이 필요 (외부 노출 금지)
 */
public final class DtoConverters {

    private DtoConverters() {}

    /* =========================
     * CargoOwnerDTO -> MemberDTO
     * ========================= */
    public static MemberDTO toMemberDTO(CargoOwnerDTO s) {
        if (s == null) return null;

        // roles: null/빈 리스트면 USER 기본 부여
        List<String> roles = normalizeRoles(s.getRoleNames(), "USER");

        // MemberDTO는 User(super)로 인해 전체 필드를 받는 생성자를 사용해야 함
        return new MemberDTO(
                s.getCargoId(),
                s.getCargoPw(),                 // ⚠️ 해시 전제. 외부로 노출 금지(@JsonIgnore)
                s.getCargoEmail(),
                s.getCargoName(),
                s.getCargoPhone(),
                s.getCargoAddress(),
                // MemberDTO 필드명: memCreateIdDateTime  (원문 그대로 사용)
                s.getCargoCreatedDateTime(),
                roles
        );
    }

    public static List<MemberDTO> toMemberDTOList(List<CargoOwnerDTO> src) {
        if (src == null) return Collections.emptyList();
        return src.stream()
                  .filter(Objects::nonNull)
                  .map(DtoConverters::toMemberDTO)
                  .collect(Collectors.toList());
    }

    /* =========================
     * MemberDTO -> CargoOwnerDTO
     * ========================= */
    public static CargoOwnerDTO toCargoOwnerDTO(MemberDTO s) {
        if (s == null) return null;

        // roles: null/빈 리스트면 USER 기본 부여
        List<String> roles = normalizeRoles(s.getRoleNames(), "USER");

        return new CargoOwnerDTO(
                s.getMemId(),
                s.getMemPw(),                    // ⚠️ 해시 전제. 외부로 노출 금지(@JsonIgnore)
                s.getMemEmail(),
                s.getMemName(),
                s.getMemPhone(),
                s.getMemAddress(),
                // CargoOwnerDTO 필드명: cargoCreatedDateTime
                s.getMemCreateIdDateTime(),      // 원문 필드명 그대로 매핑
                roles
        );
    }

    public static List<CargoOwnerDTO> toCargoOwnerDTOList(List<MemberDTO> src) {
        if (src == null) return Collections.emptyList();
        return src.stream()
                  .filter(Objects::nonNull)
                  .map(DtoConverters::toCargoOwnerDTO)
                  .collect(Collectors.toList());
    }

    /* =========================
     * 공통 보조
     * ========================= */
    private static List<String> normalizeRoles(List<String> src, String defaultRole) {
        List<String> roles = (src == null || src.isEmpty())
                ? new ArrayList<>(List.of(defaultRole))
                : new ArrayList<>(src);
        return roles;
    }
}
