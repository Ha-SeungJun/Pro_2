package com.giproject.dto.report;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserReportDTO {

	private Long id;//신고 번호
	private String reporterId;// 신고유저
	private String targetId;// 신고대상
	private String targetName; // 신고대상 이름
	private String content;// 신고내용
	private LocalDateTime createdAt;// 신고일
	private boolean adminRead;//관리자 체크
}
