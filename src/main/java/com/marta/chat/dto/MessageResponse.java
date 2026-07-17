package com.marta.chat.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.marta.chat.model.SenderRole;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class MessageResponse {
    private UUID id;
    private SenderRole sender;
    private String text;
    private LocalDateTime sentAt;
}
