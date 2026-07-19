package com.marta.chat.repository;

import com.marta.chat.model.DiagnosticSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface DiagnosticSessionRepository extends JpaRepository<DiagnosticSession, UUID> {
    // A helper method so a student can look at their past chat history!
    List<DiagnosticSession> findByParticipantId(UUID participantId);

    // Prevents a student from starting the same case twice!
    boolean existsByParticipantIdAndCaseId(UUID participantId, UUID caseId);

    // Helps us check if a case is IN_PROGRESS or COMPLETED
    java.util.Optional<DiagnosticSession> findByParticipantIdAndCaseId(UUID participantId, UUID caseId);
}
