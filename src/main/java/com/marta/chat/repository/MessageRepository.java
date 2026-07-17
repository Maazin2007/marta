package com.marta.chat.repository;

import com.marta.chat.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    // A helper method to pull the entire chat history for a specific session
    // We order it by "sentAt" so the chat bubbles show up in chronological order!
    List<Message> findBySessionIdOrderBySentAtAsc(UUID sessionId);
}
