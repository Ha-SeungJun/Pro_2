package com.giproject.controller.qna;

import com.giproject.dto.qna.MyInquiryDTO;
import com.giproject.security.JwtService;
import com.giproject.service.qna.MyInquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/g2i4/qna")
@RequiredArgsConstructor
public class MyInquiryController {

    private final MyInquiryService service;
    private final JwtService jwtService;

    @GetMapping("/my")
    public List<MyInquiryDTO> my(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        String token = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7) : authHeader;
        if (token == null || !jwtService.validate(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
        String userId = jwtService.getUsername(token);
        return service.list(userId, Math.max(1, Math.min(50, limit)));
    }
}
