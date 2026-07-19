package com.marta.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

// This is the response from the AI patient service
@Data
@AllArgsConstructor
public class AiPatientResponse {
    // The reply from the AI patient
    private String patientReply;
    // Whether the student successfully found a diagnosis
    private Boolean diagnosisFound;
    // The diagnosis found by the student for record keeping
    private String diagnosis;
}
