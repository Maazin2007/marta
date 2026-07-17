package com.marta.chat.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;


@Data
public class SendMessageRequest {
    @NotBlank(message = "Message is required")
    private String message; // the message to send
    
}
