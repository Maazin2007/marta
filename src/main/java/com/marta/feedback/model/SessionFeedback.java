package com.marta.feedback.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "session_feedback")
@Data
@NoArgsConstructor
public class SessionFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "session_id", nullable = false, unique = true)
    private UUID sessionId;

    @Column(name = "participant_id", nullable = false)
    private UUID participantId;

    // --- 9 Likert Scale Questions (1-5) ---
    private Integer satisfaction;
    private Integer answeredAllQuestions;
    private Integer naturalness;
    private Integer improvedCommunication;
    private Integer improvedConfidence;
    private Integer contributionToDevelopment;
    private Integer ableToAskAllQuestions;
    private Integer wouldRecommend;
    private Integer shouldBeInCurriculum;

    // --- 1 Pre-resolution Confidence Scale (1-5) ---
    private Integer diagnosticConfidence;

    // --- 2 Open-ended Text Questions ---
    @Column(columnDefinition = "TEXT")
    private String studentDiagnosisReasoning;

    @Column(columnDefinition = "TEXT")
    private String suggestedModifications;

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;
}
