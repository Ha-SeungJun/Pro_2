package com.giproject.controller.admin;

import com.giproject.dto.admin.AdminMemberDTO;
import com.giproject.service.admin.AdminMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/g2i4/admin/members")
public class AdminMemberController {

	private final AdminMemberService adminMemberService;

	@GetMapping
	public ResponseEntity<Page<AdminMemberDTO>> list(
			@RequestParam(name = "type", required = false, defaultValue = "ALL") String type,
			@RequestParam(name = "keyword", required = false) String keyword,
			@RequestParam(name = "searchType", required = false) String searchType,
			@PageableDefault(size = 10, sort = "memCreateidDateTime", direction = Sort.Direction.DESC) Pageable pageable) {
		log.info("[/g2i4/admin/members] IN type={}, keyword={}, searchType={}, page={}, size={}, sort={}", type, keyword, searchType,
				pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());

		try {
			Page<AdminMemberDTO> result = adminMemberService.list(type, keyword, searchType, pageable);
			log.info("[/g2i4/admin/members] OUT totalElements={}, totalPages={}", result.getTotalElements(),
					result.getTotalPages());
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			log.error("[/g2i4/admin/members] ERROR type={}, keyword={}, pageable={}", type, keyword, pageable, e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"AdminMemberService.list failed: " + e.getClass().getSimpleName() + ": " + e.getMessage(), e);
		}
	}

	
	
	@GetMapping("/owners")
	public Page<AdminMemberDTO> owners(@RequestParam(required = false) String keyword,
			@PageableDefault(size = 20, sort = "memCreateidDateTime", direction = Sort.Direction.DESC) Pageable pageable) {
		return adminMemberService.owners(keyword, pageable);
	}

	@GetMapping("/cowners")
	public Page<AdminMemberDTO> cowners(@RequestParam(required = false) String keyword,
			@PageableDefault(size = 20, sort = "memCreateidDateTime", direction = Sort.Direction.DESC) Pageable pageable) {
		return adminMemberService.cowners(keyword, pageable);
	}

	@GetMapping("/admin")
	public Page<AdminMemberDTO> admins(@RequestParam(required = false) String keyword,
			@PageableDefault(size = 20, sort = "memCreateidDateTime", direction = Sort.Direction.DESC) Pageable pageable) {
		return adminMemberService.admins(keyword, pageable);
	}
}