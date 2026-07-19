package com.marta.chat.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // Links this message to a specific Diagnostic Session
    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    // Is this from the STUDENT, the PATIENT (AI), or SYSTEM?
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_role", nullable = false)
    private SenderRole senderRole;

    // The actual chat bubble text
    // we need to add column definition to allow for longer text as default is 255 characters
    @Column(name = "text_content", columnDefinition = "TEXT", nullable = false)
    private String textContent;

    @CreationTimestamp
    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    public Message(UUID sessionId, SenderRole senderRole, String textContent) {
        this.sessionId = sessionId;
        this.senderRole = senderRole;
        this.textContent = textContent;
    }
}
