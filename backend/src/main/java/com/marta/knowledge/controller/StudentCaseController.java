package com.marta.knowledge.controller;

import com.marta.chat.dto.CaseStatusResponse;
import com.marta.chat.model.DiagnosticSession;
import com.marta.chat.repository.DiagnosticSessionRepository;
import com.marta.knowledge.model.Case;
import com.marta.knowledge.repository.CaseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/cases")
public class StudentCaseController {

    private final CaseRepository caseRepository;
    private final DiagnosticSessionRepository diagnosticSessionRepository;

    public StudentCaseController(CaseRepository caseRepository, DiagnosticSessionRepository diagnosticSessionRepository) {
        this.caseRepository = caseRepository;
        this.diagnosticSessionRepository = diagnosticSessionRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<List<CaseStatusResponse>> getActiveCases(Authentication authentication) {
        // Extract the participant ID from the JWT authentication object
        UUID participantId = UUID.fromString(authentication.getName());

        List<Case> activeCases = caseRepository.findAll().stream()
                .filter(Case::isActive)
                .toList();

        List<CaseStatusResponse> responseList = new ArrayList<>();

        for (Case c : activeCases) {
            Optional<DiagnosticSession> sessionOpt = diagnosticSessionRepository.findByParticipantIdAndCaseId(participantId, c.getId());

            String status = "NOT_STARTED";
            UUID sessionId = null;

            if (sessionOpt.isPresent()) {
                DiagnosticSession session = sessionOpt.get();
                sessionId = session.getId();
                if (session.isDiagnosisReached()) {
                    status = "COMPLETED";
                } else {
                    status = "IN_PROGRESS";
                }
            }

            responseList.add(new CaseStatusResponse(
                    c.getId(),
                    c.getTitle(),
                    c.getCategory(),
                    c.getDifficultyLevel(),
                    status,
                    sessionId
            ));
        }

        return ResponseEntity.ok(responseList);
    }
}
