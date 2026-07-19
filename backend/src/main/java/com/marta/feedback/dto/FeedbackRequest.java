package com.marta.feedback.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class FeedbackRequest {

    @NotNull(message = "Session ID is required")
    private UUID sessionId;

    @Min(1) @Max(5) private Integer satisfaction;
    @Min(1) @Max(5) private Integer answeredAllQuestions;
    @Min(1) @Max(5) private Integer naturalness;
    @Min(1) @Max(5) private Integer improvedCommunication;
    @Min(1) @Max(5) private Integer improvedConfidence;
    @Min(1) @Max(5) private Integer contributionToDevelopment;
    @Min(1) @Max(5) private Integer ableToAskAllQuestions;
    @Min(1) @Max(5) private Integer wouldRecommend;
    @Min(1) @Max(5) private Integer shouldBeInCurriculum;
    
    @Min(1) @Max(5) private Integer diagnosticConfidence;

    private String studentDiagnosisReasoning;
    private String suggestedModifications;
}
