package com.marta.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    @NotBlank(message = "Participant ID is required")
    private String participantId;
    @NotBlank(message = "PIN is required")
    @Size(min = 6, max = 6, message = "PIN must be exactly 6 digits")
    private String pin;
    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String newPassword;
}
