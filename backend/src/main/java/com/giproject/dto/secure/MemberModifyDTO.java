package com.giproject.dto.secure;

import lombok.Data;

@Data
public class MemberModifyDTO {
	
	private String memId;
	private String memPw;
	private String memAddress;
}
