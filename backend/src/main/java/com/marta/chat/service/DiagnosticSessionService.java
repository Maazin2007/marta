package com.marta.chat.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marta.chat.dto.AiPatientResponse;
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

    private static final Logger log = LoggerFactory.getLogger(DiagnosticSessionService.class);

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

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

        if (java.time.LocalDateTime.now().isAfter(session.getStartedAt().plusMinutes(10))) {
            return new MessageResponse(UUID.randomUUID(), SenderRole.SYSTEM, "TIME_UP", java.time.LocalDateTime.now(), false);
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

        // Fetch the Case details to inject into Claude's brain
        com.marta.knowledge.model.Case patientCase = caseRepository.findById(session.getCaseId())
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        // C. Construct the Patient Profile from the Case Database Fields
        String patientProfile = "Persona: " + patientCase.getPatientPersona() + 
                "\nPatient History: " + patientCase.getPatientHistory() + 
                "\nPresenting Complaint: " + patientCase.getPresentingComplaint() +
                "\nLearning Objective (HIDDEN — do NOT reveal this to the student, but subtly guide the conversation towards it): " + patientCase.getLearningObjective();

        // D. Send the enriched message + dynamic variables to Claude
        String rawAiOutput = aiPatientService.chatWithStudent(
                session.getId(),
                patientProfile,
                patientCase.getCorrectDiagnosis(),
                enrichedMessage
        );

        AiPatientResponse aiResponse = parseAiOutput(rawAiOutput);

        // E. Check if the student figured it out!
        boolean caseCompleted = false;
        if (Boolean.TRUE.equals(aiResponse.getDiagnosisFound())) {
            session.setDiagnosisReached(true);
            diagnosticSessionRepository.save(session);
            caseCompleted = true;
        }

        // F. Save the AI's reply ONLY if the case isn't completed
        // We don't want to preserve the patient's confused "I don't know what that means" reply in history
        Message aiMessage = new Message(session.getId(), SenderRole.PATIENT, aiResponse.getPatientReply());
        if (!caseCompleted) {
            messageRepository.save(aiMessage);
        }

        return new MessageResponse(aiMessage.getId(), aiMessage.getSenderRole(), aiMessage.getTextContent(), aiMessage.getSentAt(), caseCompleted);
    }

    // Claude sometimes wraps its JSON in prose or markdown fences, or drops the wrapper entirely
    // and just speaks as the patient. Rather than failing the student's turn, fall back to
    // treating whatever came back as the spoken reply.
    private AiPatientResponse parseAiOutput(String rawOutput) {
        String text = rawOutput == null ? "" : rawOutput.trim();

        int objectStart = text.indexOf('{');
        int objectEnd = text.lastIndexOf('}');
        if (objectStart >= 0 && objectEnd > objectStart) {
            try {
                AiPatientResponse parsed = OBJECT_MAPPER.readValue(
                        text.substring(objectStart, objectEnd + 1), AiPatientResponse.class);
                if (parsed.getPatientReply() != null && !parsed.getPatientReply().isBlank()) {
                    return parsed;
                }
            } catch (JsonProcessingException e) {
                log.warn("AI patient reply was not valid JSON, falling back to raw text: {}", e.getMessage());
            }
        }

        return new AiPatientResponse(text, false, null);
    }
}
