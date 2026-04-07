package com.giproject.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long>{

}
