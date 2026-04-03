package com.giproject.dto.common;

import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter
public class UpdateUserDTO {
	private String id;
	private String userType;
    private String name;
    private String address;
}