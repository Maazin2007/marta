package com.marta.chat.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CaseStatusResponse {
    private UUID caseId;
    private String title;
    private String category;
    private String difficultyLevel;
    private String presentingComplaint;
    private String status; // "NOT_STARTED", "IN_PROGRESS", "COMPLETED", "PENDING_FEEDBACK"
    private UUID sessionId; // Provide the sessionId if it's IN_PROGRESS or COMPLETED so the frontend can resume
    private java.time.LocalDateTime startedAt;
}
