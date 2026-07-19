package com.marta.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResearcherLoginRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Min(value = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "PIN is required")
    @Size(min = 6, max = 6, message = "PIN must be exactly 6 digits")
    private String pin;
}
