package com.marta.feedback.repository;

import com.marta.feedback.model.SessionFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SessionFeedbackRepository extends JpaRepository<SessionFeedback, UUID> {
    boolean existsBySessionId(UUID sessionId);
}
