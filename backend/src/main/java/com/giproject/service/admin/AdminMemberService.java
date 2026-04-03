package com.giproject.service.admin;

import com.giproject.dto.admin.AdminMemberDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminMemberService {

	Page<AdminMemberDTO> list(String type, String keyword, String searchType, Pageable pageable);

	Page<AdminMemberDTO> owners(String keyword, Pageable pageable);

	Page<AdminMemberDTO> cowners(String keyword, Pageable pageable);

	Page<AdminMemberDTO> admins(String keyword, Pageable pageable);
}