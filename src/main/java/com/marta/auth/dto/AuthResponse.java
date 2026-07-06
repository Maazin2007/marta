package com.marta.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AuthResponse {
    private boolean success;
    private boolean registered;
    private UUID userId;
    private String message;
}
