package com.marta.chat.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.marta.chat.dto.MessageResponse;
import com.marta.chat.dto.SendMessageRequest;
import com.marta.chat.model.DiagnosticSession;
import com.marta.chat.model.Message;
import com.marta.chat.model.SenderRole;
import com.marta.chat.repository.DiagnosticSessionRepository;
import com.marta.chat.repository.MessageRepository;
import com.marta.knowledge.repository.CaseRepository;

import jakarta.transaction.Transactional;

@Service
public class DiagnosticSessionService {
    
    private final DiagnosticSessionRepository diagnosticSessionRepository;
    private final MessageRepository messageRepository;
    private final CaseRepository caseRepository;
    private final AiPatientService aiPatientService;
    private final com.marta.knowledge.service.KnowledgeRetrievalService knowledgeRetrievalService;

    // constructor to inject the dependencies
    public DiagnosticSessionService(DiagnosticSessionRepository diagnosticSessionRepository, 
                                    MessageRepository messageRepository, 
                                    CaseRepository caseRepository,
                                    AiPatientService aiPatientService,
                                    com.marta.knowledge.service.KnowledgeRetrievalService knowledgeRetrievalService) {
        this.diagnosticSessionRepository = diagnosticSessionRepository;
        this.messageRepository = messageRepository;
        this.caseRepository = caseRepository;
        this.aiPatientService = aiPatientService;
        this.knowledgeRetrievalService = knowledgeRetrievalService;
    }

    @Transactional
    public DiagnosticSession startSession(UUID participantId, UUID caseId)  {
        if (!caseRepository.existsById(caseId)) {
            throw new IllegalArgumentException("Case not found");
        }

        if (diagnosticSessionRepository.existsByParticipantIdAndCaseId(participantId, caseId)) {
            throw new IllegalArgumentException("Session already exists");
        }

        DiagnosticSession diagnosticSession = new DiagnosticSession(participantId, caseId);
        return diagnosticSessionRepository.save(diagnosticSession);
    }

    @Transactional
    public List<MessageResponse> getChatHistory(UUID participantId, UUID sessionId) {
        DiagnosticSession diagnosticSession = diagnosticSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
                
        if (!diagnosticSession.getParticipantId().equals(participantId)) {
            throw new IllegalArgumentException("You are not the owner of this session");
        }
        
        return messageRepository.findBySessionIdOrderBySentAtAsc(sessionId)
                .stream()
                .map(msg -> new MessageResponse(msg.getId(), msg.getSenderRole(), msg.getTextContent(), msg.getSentAt()))
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(UUID participantId, UUID sessionId, SendMessageRequest request) {
        DiagnosticSession session = diagnosticSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (!session.getParticipantId().equals(participantId)) {
            throw new IllegalArgumentException("You are not the owner of this session");
        }

        if (session.isDiagnosisReached()) {
            throw new IllegalArgumentException("This case has already been completed.");
        }

        // A. Save the student's message
        Message studentMessage = new Message(session.getId(), SenderRole.STUDENT, request.getMessage());
        messageRepository.save(studentMessage);

        // B. RAG: Fetch relevant facts from the Postgres Vector Database!
        String relevantFacts = knowledgeRetrievalService.getRelevantMedicalContext(
                session.getCaseId(), 
                request.getMessage()
        );

        String enrichedMessage = request.getMessage() + 
                "\n\n[SYSTEM INSTRUCTION: Here is relevant academic medical literature and textbook content to assist with this case. Use it to inform your clinical reasoning and answer the student accurately. Do NOT mention that you are reading from a database:]\n\n" + 
                relevantFacts;

        // C. Send the enriched message to Claude (but we already saved the clean message to the DB for the student!)
        String aiReplyText = aiPatientService.chatWithStudent(session.getId(), enrichedMessage);
        Message aiMessage = new Message(session.getId(), SenderRole.PATIENT, aiReplyText);
        messageRepository.save(aiMessage);

        return new MessageResponse(aiMessage.getId(), aiMessage.getSenderRole(), aiMessage.getTextContent(), aiMessage.getSentAt());
    }
}
