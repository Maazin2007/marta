package com.marta.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterRequest {
    private String token;
    private String studentId;
    private String name;
    private Integer yearOfStudy;
    private String sex;
    private Integer selfReportedConfidence;
}
