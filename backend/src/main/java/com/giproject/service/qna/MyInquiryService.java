package com.giproject.service.qna;

import com.giproject.dto.qna.MyInquiryDTO;
import com.giproject.repository.qna.QnaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MyInquiryService {
    private final QnaRepository repo;

    public List<MyInquiryDTO> list(String userIdFromToken, int limit) {
        int size = Math.max(1, Math.min(50, limit));

        // 숫자로 변환 가능하면 숫자 쿼리, 아니면 문자열 쿼리
        var pageable = PageRequest.of(0, size);
        var page = tryParseLong(userIdFromToken) != null
                ? repo.findMyInquiriesByAuthorIdNum(tryParseLong(userIdFromToken), pageable)
                : repo.findMyInquiriesByAuthorIdStr(userIdFromToken, pageable);

        return page.getContent().stream()
            .map(r -> new MyInquiryDTO(
                r.getPostId(),
                r.getTitle(),
                r.getCreatedAt(),
                (r.getAnswered() != null && r.getAnswered() == 1)
            ))
            .toList();
    }

    private Long tryParseLong(String s) {
        try { return Long.valueOf(s); } catch (Exception e) { return null; }
    }
}
