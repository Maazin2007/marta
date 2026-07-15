package com.marta.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

// String -> Not blank
// everything else -> Not Null
public class RegisterRequest {
    @NotNull(message = "Year Of Study is required")
    private Integer yearOfStudy;
    @NotNull(message = "Sex is required")
    private Sex sex;
    @NotNull(message = "Self Reported Confidence is required")
    private Double selfReportedConfidence;
    @NotBlank(message = "password is required")
    private String password;
    @NotBlank(message = "pin is required")
    private String pin;
}
