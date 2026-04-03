package com.giproject.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MiscController {
    @GetMapping(value = "/favicon.ico")
    public ResponseEntity<Void> noFavicon() {
        return ResponseEntity.noContent().build(); // 204
    }
}
