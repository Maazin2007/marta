package com.marta.auth.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    @Min(value = 1, message = "Year of study must be at least 1")
    @Max(value = 10, message = "Year of study must be at most 10")
    private Integer yearOfStudy;
    
    @NotNull(message = "Sex is required")
    private Sex sex;
    
    @NotNull(message = "Self Reported Confidence is required")
    @DecimalMin(value = "0.0", message = "Confidence must be at least 0")
    @DecimalMax(value = "1.0", message = "Confidence must be at most 1")
    private Double selfReportedConfidence;
    
    @NotBlank(message = "password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;
    
    @NotBlank(message = "pin is required")
    @Size(min = 6, max = 6, message = "PIN must be exactly 6 digits")
    private String pin;
}
