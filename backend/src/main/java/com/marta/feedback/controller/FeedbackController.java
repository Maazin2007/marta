package com.marta.feedback.controller;

import com.marta.feedback.dto.FeedbackRequest;
import com.marta.feedback.model.SessionFeedback;
import com.marta.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/submit")
    public ResponseEntity<SessionFeedback> submitFeedback(
            @AuthenticationPrincipal String participantId,
            @Valid @RequestBody FeedbackRequest request) {
            
        SessionFeedback feedback = feedbackService.submitFeedback(UUID.fromString(participantId), request);
        return ResponseEntity.ok(feedback);
    }
}
