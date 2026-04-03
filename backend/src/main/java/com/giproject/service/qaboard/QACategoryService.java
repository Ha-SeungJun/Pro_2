package com.giproject.service.qaboard;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.giproject.entity.qaboard.QACategory;

/**
 * QA 카테고리 관련 서비스
 * 
 * 카테고리 목록 조회 및 정보 제공
 */
@Service
public class QACategoryService {

    /**
     * 모든 카테고리 목록 조회
     * Frontend에서 사용할 수 있는 형태로 반환
     * @return 카테고리 정보 목록 (code, name)
     */
    public List<Map<String, String>> getAllCategories() {
        return Arrays.stream(QACategory.values())
                .map(category -> Map.of(
                    "code", category.getCode(),
                    "name", category.getDisplayName()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 카테고리 코드로 표시명 조회
     * @param code 카테고리 코드
     * @return 표시명 (찾을 수 없으면 null)
     */
    public String getCategoryDisplayName(String code) {
        try {
            QACategory category = QACategory.fromCode(code);
            return category.getDisplayName();
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * 유효한 카테고리 코드인지 확인
     * @param code 카테고리 코드
     * @return 유효하면 true
     */
    public boolean isValidCategoryCode(String code) {
        return QACategory.isValidCode(code);
    }
}