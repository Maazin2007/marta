package com.marta.chat.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.marta.chat.model.SenderRole;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private UUID id;
    private SenderRole sender;
    private String text;
    private LocalDateTime sentAt;
    private Boolean caseCompleted;

    public MessageResponse(UUID id, SenderRole sender, String text, LocalDateTime sentAt) {
        this.id = id;
        this.sender = sender;
        this.text = text;
        this.sentAt = sentAt;
        this.caseCompleted = false;
    }
}
