package com.marta.feedback.service;

import com.marta.chat.model.DiagnosticSession;
import com.marta.chat.repository.DiagnosticSessionRepository;
import com.marta.feedback.dto.FeedbackRequest;
import com.marta.feedback.model.SessionFeedback;
import com.marta.feedback.repository.SessionFeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class FeedbackService {

    private final SessionFeedbackRepository feedbackRepository;
    private final DiagnosticSessionRepository sessionRepository;

    public FeedbackService(SessionFeedbackRepository feedbackRepository, DiagnosticSessionRepository sessionRepository) {
        this.feedbackRepository = feedbackRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional
    public SessionFeedback submitFeedback(UUID participantId, FeedbackRequest request) {
        // 1. Check if the session exists and belongs to the student
        DiagnosticSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        
        if (!session.getParticipantId().equals(participantId)) {
            throw new IllegalArgumentException("You can only submit feedback for your own sessions");
        }

        // 2. Ensure they haven't already submitted feedback
        if (feedbackRepository.existsBySessionId(request.getSessionId())) {
            throw new IllegalArgumentException("Feedback already submitted for this session");
        }

        // 3. Map the DTO to the Entity
        SessionFeedback feedback = new SessionFeedback();
        feedback.setSessionId(request.getSessionId());
        feedback.setParticipantId(participantId);
        
        feedback.setSatisfaction(request.getSatisfaction());
        feedback.setAnsweredAllQuestions(request.getAnsweredAllQuestions());
        feedback.setNaturalness(request.getNaturalness());
        feedback.setImprovedCommunication(request.getImprovedCommunication());
        feedback.setImprovedConfidence(request.getImprovedConfidence());
        feedback.setContributionToDevelopment(request.getContributionToDevelopment());
        feedback.setAbleToAskAllQuestions(request.getAbleToAskAllQuestions());
        feedback.setWouldRecommend(request.getWouldRecommend());
        feedback.setShouldBeInCurriculum(request.getShouldBeInCurriculum());
        
        feedback.setDiagnosticConfidence(request.getDiagnosticConfidence());
        
        feedback.setStudentDiagnosisReasoning(request.getStudentDiagnosisReasoning());
        feedback.setSuggestedModifications(request.getSuggestedModifications());

        return feedbackRepository.save(feedback);
    }
}
