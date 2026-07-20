package com.marta.chat.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marta.chat.dto.MessageResponse;
import com.marta.chat.dto.SendMessageRequest;
import com.marta.chat.dto.StartSessionRequest;
import com.marta.chat.model.DiagnosticSession;
import com.marta.chat.service.DiagnosticSessionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/chat")
public class DiagnosticSessionController {
    
    private final DiagnosticSessionService diagnosticSessionService;

    public DiagnosticSessionController(DiagnosticSessionService diagnosticSessionService) {
        this.diagnosticSessionService = diagnosticSessionService;
    }

    // 1. START A NEW SESSION
    @PostMapping("/start")
    public ResponseEntity<DiagnosticSession> startSession(
            @AuthenticationPrincipal String participantId, 
            @Valid @RequestBody StartSessionRequest request) {
            
        DiagnosticSession session = diagnosticSessionService.startSession(UUID.fromString(participantId), request.getCaseId());
        return ResponseEntity.ok(session);
    }

    // 2. GET ENTIRE CHAT HISTORY
    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<MessageResponse>> getChatHistory(
            @AuthenticationPrincipal String participantId, 
            @PathVariable UUID sessionId) {
            
        List<MessageResponse> history = diagnosticSessionService.getChatHistory(UUID.fromString(participantId), sessionId);
        return ResponseEntity.ok(history);
    }

    // 3. SEND A MESSAGE TO THE AI PATIENT
    @PostMapping("/{sessionId}/message")
    @RateLimiter(name = "chatLimit")
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal String participantId,
            @PathVariable UUID sessionId,
            @Valid @RequestBody SendMessageRequest request) {
            
        MessageResponse aiReply = diagnosticSessionService.sendMessage(UUID.fromString(participantId), sessionId, request);
        return ResponseEntity.ok(aiReply);
    }
}
