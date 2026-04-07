package com.giproject.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.entity.ChatMessage;
import com.giproject.repository.ChatMessageRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
	private final ChatMessageRepository repository;
	
	@PostMapping("/send")
	public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage msg){
		return ResponseEntity.ok(repository.save(msg));
	}
	
	@GetMapping("/history")
	public List<ChatMessage> getHistory(){
		return repository.findAll();
		
	}

}
