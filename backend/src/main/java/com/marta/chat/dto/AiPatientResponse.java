package com.marta.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// This is the response from the AI patient service
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiPatientResponse {
    // The reply from the AI patient
    private String patientReply;
    // Whether the student successfully found a diagnosis
    private Boolean diagnosisFound;
    // The diagnosis found by the student for record keeping
    private String diagnosis;
}
