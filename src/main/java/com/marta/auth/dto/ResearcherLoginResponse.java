package com.marta.auth.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class ResearcherLoginResponse {
    private String jwtToken;
}
