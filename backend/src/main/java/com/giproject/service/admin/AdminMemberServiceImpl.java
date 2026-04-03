package com.giproject.service.admin;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.dto.admin.AdminMemberDTO;
import com.giproject.dto.admin.AdminMemberSearchDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.account.UserIndex.Role;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class AdminMemberServiceImpl implements AdminMemberService {

	private final MemberRepository memberRepository;
	private final CargoOwnerRepository cargoOwnerRepository;
	private final AdminDeliveryService adminDeliveryService; // Added
	private final UserIndexRepository userIndexRepository; // Added

	@Override
	public Page<AdminMemberDTO> list(String type, String keyword, String searchType, Pageable pageable) {
		String t = (type == null ? "all" : type.trim()).toUpperCase(Locale.ROOT);
		boolean hasKeyword = keyword != null && !keyword.isBlank();

		log.info("[Service] list IN type={}, hasKeyword={}, searchType={}, pageable={}", t, hasKeyword, searchType, pageable);

		List<AdminMemberDTO> rows = new ArrayList<>();
		try {
			if (hasKeyword && "name".equalsIgnoreCase(searchType)) {
                log.info("[NameSearch] Starting name search for type '{}' with keyword '{}'", t, keyword);
				if ("ALL".equals(t) || "OWNER".equals(t) || "ADMIN".equals(t)) {
					List<Member> members = memberRepository.findByMemNameContainingIgnoreCase(keyword);
                    log.info("[NameSearch] Found {} members for keyword '{}'", members.size(), keyword);
					members.forEach(m -> {
                        log.info("[NameSearch] Processing member: {}", m.getMemId());
						userIndexRepository.findByLoginId(m.getMemId()).ifPresent(ui -> {
                            log.info("[NameSearch] Found UserIndex for {}: role={}", ui.getLoginId(), ui.getRole());
							if (ui.getRole() == Role.SHIPPER && ("ALL".equals(t) || "OWNER".equals(t))) {
                                log.info("[NameSearch] Adding owner DTO for {}", m.getMemId());
								rows.add(ownerToDto(m));
							} else if (ui.getRole() == Role.ADMIN && ("ALL".equals(t) || "ADMIN".equals(t))) {
                                log.info("[NameSearch] Adding admin DTO for {}", m.getMemId());
								rows.add(adminToDto(m));
							}
						});
					});
				}
				if ("ALL".equals(t) || "COWNER".equals(t)) {
					List<CargoOwner> cargoOwners = cargoOwnerRepository.findByCargoNameContainingIgnoreCase(keyword);
                    log.info("[NameSearch] Found {} cargo owners for keyword '{}'", cargoOwners.size(), keyword);
					cargoOwners.forEach(c -> {
                        log.info("[NameSearch] Adding cowner DTO for {}", c.getCargoId());
                        rows.add(cownerToDto(c));
                    });
				}
			} else {
				// Existing logic for ID/email search
				switch (t) {
					case "OWNER":
						rows.addAll(toOwners(hasKeyword ? keyword : null));
						break;
					case "COWNER":
						rows.addAll(toCowners(hasKeyword ? keyword : null));
						break;
					case "ADMIN":
						rows.addAll(toAdmins(hasKeyword ? keyword : null));
						break;
					default:
						List<UserIndex.Role> roles = List.of(UserIndex.Role.SHIPPER, UserIndex.Role.DRIVER);
						List<UserIndex> userIndices;
						if (hasKeyword) {
							userIndices = userIndexRepository.findByRolesAndKeyword(roles, keyword);
						} else {
							userIndices = userIndexRepository.findByRoles(roles);
						}
						List<AdminMemberDTO> merged = userIndices.stream()
								.map(ui -> {
									if (ui.getRole() == UserIndex.Role.SHIPPER) {
										return memberRepository.findByMemId(ui.getLoginId())
												.map(this::ownerToDto)
												.orElse(null);
									} else if (ui.getRole() == UserIndex.Role.DRIVER) {
										return cargoOwnerRepository.findByCargoId(ui.getLoginId())
												.map(this::cownerToDto)
												.orElse(null);
									} else if (ui.getRole() == UserIndex.Role.ADMIN) {
										return memberRepository.findByMemId(ui.getLoginId())
												.map(this::adminToDto)
												.orElse(null);
									}
									return null;
								})
								.filter(java.util.Objects::nonNull)
								.collect(Collectors.toList());
						rows.addAll(merged);
						break;
				}
			}
		} catch (Exception e) {
			log.error("[Service] building rows failed: type={}, keyword={}", t, keyword, e);
			throw e;
		}

		log.info("[Service] rows.size={}", (rows == null ? -1 : rows.size()));

		// 정렬
		if (pageable != null && pageable.getSort().isSorted() && rows != null && rows.size() > 1) {
			for (Sort.Order o : pageable.getSort()) {
				String prop = o.getProperty();
				boolean asc = o.isAscending();
				log.info("[Service] sort by {} {}", prop, asc ? "ASC" : "DESC");

				Comparator<AdminMemberDTO> comparator = null;
				if ("memCreateidDateTime".equalsIgnoreCase(prop)) {
					comparator = Comparator.comparing((AdminMemberDTO dto) -> Optional
							.ofNullable(dto.getMemCreateidDateTime()).orElse(LocalDateTime.MIN));
				} else if ("memName".equalsIgnoreCase(prop)) {
					comparator = Comparator
							.comparing((AdminMemberDTO dto) -> Optional.ofNullable(dto.getMemName()).orElse(""));
				} else if ("memId".equalsIgnoreCase(prop)) {
					comparator = Comparator
							.comparing((AdminMemberDTO dto) -> Optional.ofNullable(dto.getMemId()).orElse(""));
				}
				if (comparator != null) {
					if (!asc)
						comparator = comparator.reversed();
					try {
						rows.sort(comparator);
					} catch (Exception e) {
						log.error("[Service] sort failed: prop={}", prop, e);
					}
				}
			}
		}

		int page = pageable == null ? 0 : pageable.getPageNumber();
		int size = pageable == null ? 20 : pageable.getPageSize();
		int from = Math.min(page * size, rows.size());
		int to = Math.min(from + size, rows.size());
		List<AdminMemberDTO> slice = rows.subList(from, to);

		Page<AdminMemberDTO> result = new PageImpl<>(slice, (pageable == null ? PageRequest.of(0, size) : pageable),
				rows.size());

		log.info("[Service] OUT totalElements={}, totalPages={}, slice={}", result.getTotalElements(),
				result.getTotalPages(), slice.size());
		return result;
	}

	@Override
	public Page<AdminMemberDTO> owners(String keyword, Pageable pageable) {
		return list("OWNER", keyword, null, pageable);
	}

	@Override
	public Page<AdminMemberDTO> cowners(String keyword, Pageable pageable) {
		return list("COWNER", keyword, null, pageable);
	}

	@Override
	public Page<AdminMemberDTO> admins(String keyword, Pageable pageable) {
		return list("ADMIN", keyword, null, pageable);
	}

	private List<AdminMemberDTO> toOwners(String keyword) {
		List<UserIndex> userIndices;
		if (keyword != null && !keyword.isBlank()) {
			userIndices = userIndexRepository.findByRoleAndKeyword(Role.SHIPPER, keyword);
		} else {
			userIndices = userIndexRepository.findByRole(Role.SHIPPER);
		}
		return userIndices.stream()
				.map(ui -> memberRepository.findByMemId(ui.getLoginId()))
				.filter(Optional::isPresent)
				.map(Optional::get)
				.map(this::ownerToDto)
				.collect(Collectors.toList());
	}

	private List<AdminMemberDTO> toAdmins(String keyword) {
		List<UserIndex> userIndices;
		if (keyword != null && !keyword.isBlank()) {
			userIndices = userIndexRepository.findByRoleAndKeyword(Role.ADMIN, keyword);
		} else {
			userIndices = userIndexRepository.findByRole(Role.ADMIN);
		}
		return userIndices.stream()
				.map(ui -> memberRepository.findByMemId(ui.getLoginId()))
				.filter(Optional::isPresent)
				.map(Optional::get)
				.map(this::adminToDto)
				.collect(Collectors.toList());
	}

	private List<AdminMemberDTO> toCowners(String keyword) {
		List<UserIndex> userIndices;
		if (keyword != null && !keyword.isBlank()) {
			userIndices = userIndexRepository.findByRoleAndKeyword(Role.DRIVER, keyword);
		} else {
			userIndices = userIndexRepository.findByRole(Role.DRIVER);
		}
		return userIndices.stream()
				.map(ui -> cargoOwnerRepository.findByCargoId(ui.getLoginId()))
				.filter(Optional::isPresent)
				.map(Optional::get)
				.map(this::cownerToDto)
				.collect(Collectors.toList());
	}

	private AdminMemberDTO ownerToDto(Member m) {
		// Fetch delivery details using AdminDeliveryService
		AdminMemberSearchDTO deliveryDetails = adminDeliveryService.searchUserForDeliveryPage(m.getMemId()).stream()
				.filter(dto -> "OWNER".equals(dto.getUserType())) // Ensure we get the OWNER's details
				.findFirst()
				.orElse(null);

		return AdminMemberDTO.builder().type("OWNER").memId(nullToEmpty(m.getMemId()))
				.memName(nullToEmpty(m.getMemName())).memEmail(nullToEmpty(m.getMemEmail()))
				.memPhone(nullToEmpty(m.getMemPhone())).memAdress(nullToEmpty(m.getMemAddress()))
				.memCreateidDateTime(m.getMemCreateIdDateTime())
				// Add delivery-related fields
				.orders(deliveryDetails != null ? deliveryDetails.getOrders() : 0)
				.status(deliveryDetails != null ? deliveryDetails.getStatus() : null)
				.details(deliveryDetails != null ? deliveryDetails.getDetails() : null)
				.history(deliveryDetails != null ? deliveryDetails.getHistory() : null)
				.build();
	}

	private AdminMemberDTO adminToDto(Member m) {
		return AdminMemberDTO.builder().type("ADMIN").memId(nullToEmpty(m.getMemId()))
				.memName(nullToEmpty(m.getMemName())).memEmail(nullToEmpty(m.getMemEmail()))
				.memPhone(nullToEmpty(m.getMemPhone())).memAdress(nullToEmpty(m.getMemAddress()))
				.memCreateidDateTime(m.getMemCreateIdDateTime()).build();
	}

	private AdminMemberDTO cownerToDto(CargoOwner c) {
		// Fetch delivery details using AdminDeliveryService
		AdminMemberSearchDTO deliveryDetails = adminDeliveryService.searchUserForDeliveryPage(c.getCargoId()).stream()
				.filter(dto -> "COWNER".equals(dto.getUserType())) // Ensure we get the COWNER's details
				.findFirst()
				.orElse(null);

		return AdminMemberDTO.builder().type("COWNER").memId(nullToEmpty(c.getCargoId()))
				.memName(nullToEmpty(c.getCargoName())).memEmail(nullToEmpty(c.getCargoEmail()))
				.memPhone(nullToEmpty(c.getCargoPhone())).memAdress(nullToEmpty(c.getCargoAddress()))
				.memCreateidDateTime(c.getCargoCreatedDateTime())
				// Add delivery-related fields
				.orders(deliveryDetails != null ? deliveryDetails.getOrders() : 0)
				.status(deliveryDetails != null ? deliveryDetails.getStatus() : null)
				.details(deliveryDetails != null ? deliveryDetails.getDetails() : null)
				.history(deliveryDetails != null ? deliveryDetails.getHistory() : null)
				.build();
	}

	private static String nullToEmpty(String s) {
		return s == null ? "" : s;
	}
	
	private boolean contains(String s, String needleLower) {
		return s != null && s.toLowerCase(Locale.ROOT).contains(needleLower);
	}

	
}