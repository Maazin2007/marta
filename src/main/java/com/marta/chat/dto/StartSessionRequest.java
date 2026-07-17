package com.marta.chat.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
public class StartSessionRequest {
    @NotNull(message = "Case ID is required")
    private UUID caseId; // the case ID to start the session for
}
