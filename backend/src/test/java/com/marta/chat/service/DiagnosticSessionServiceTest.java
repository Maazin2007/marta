package com.marta.chat.service;

import com.marta.chat.dto.MessageResponse;
import com.marta.chat.dto.SendMessageRequest;
import com.marta.chat.model.DiagnosticSession;
import com.marta.chat.model.Message;
import com.marta.chat.model.SenderRole;
import com.marta.chat.repository.DiagnosticSessionRepository;
import com.marta.chat.repository.MessageRepository;
import com.marta.knowledge.model.Case;
import com.marta.knowledge.repository.CaseRepository;
import com.marta.knowledge.service.KnowledgeRetrievalService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DiagnosticSessionServiceTest {

    @Mock
    private DiagnosticSessionRepository diagnosticSessionRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private CaseRepository caseRepository;

    @Mock
    private AiPatientService aiPatientService;

    @Mock
    private KnowledgeRetrievalService knowledgeRetrievalService;

    @InjectMocks
    private DiagnosticSessionService diagnosticSessionService;

    // ==========================================
    // START SESSION TESTS
    // ==========================================

    @Test
    void testStartSession_Success() {
        UUID participantId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();

        when(caseRepository.existsById(caseId)).thenReturn(true);
        when(diagnosticSessionRepository.existsByParticipantIdAndCaseId(participantId, caseId)).thenReturn(false);
        
        // When save is called, return whatever was passed in
        when(diagnosticSessionRepository.save(any(DiagnosticSession.class))).thenAnswer(i -> i.getArguments()[0]);

        DiagnosticSession session = diagnosticSessionService.startSession(participantId, caseId);

        assertNotNull(session);
        assertEquals(participantId, session.getParticipantId());
        assertEquals(caseId, session.getCaseId());
        verify(diagnosticSessionRepository, times(1)).save(any(DiagnosticSession.class));
    }

    @Test
    void testStartSession_CaseNotFound() {
        UUID participantId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();

        when(caseRepository.existsById(caseId)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            diagnosticSessionService.startSession(participantId, caseId);
        });

        assertEquals("Case not found", exception.getMessage());
        verify(diagnosticSessionRepository, never()).save(any());
    }

    // ==========================================
    // GET CHAT HISTORY TESTS
    // ==========================================

    @Test
    void testGetChatHistory_Success() {
        UUID participantId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        DiagnosticSession session = new DiagnosticSession(participantId, UUID.randomUUID());
        
        Message msg1 = new Message(sessionId, SenderRole.STUDENT, "Hello");
        Message msg2 = new Message(sessionId, SenderRole.PATIENT, "My tooth hurts");

        when(diagnosticSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(messageRepository.findBySessionIdOrderBySentAtAsc(sessionId)).thenReturn(Arrays.asList(msg1, msg2));

        List<MessageResponse> history = diagnosticSessionService.getChatHistory(participantId, sessionId);

        assertEquals(2, history.size());
        assertEquals("Hello", history.get(0).getText());
        assertEquals(SenderRole.STUDENT, history.get(0).getSender());
    }

    @Test
    void testGetChatHistory_NotOwner() {
        UUID hackerId = UUID.randomUUID();
        UUID realOwnerId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        DiagnosticSession session = new DiagnosticSession(realOwnerId, UUID.randomUUID());

        when(diagnosticSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            diagnosticSessionService.getChatHistory(hackerId, sessionId);
        });

        assertEquals("You are not the owner of this session", exception.getMessage());
    }

    // ==========================================
    // SEND MESSAGE TESTS
    // ==========================================

    @Test
    void testSendMessage_Success_OngoingChat() {
        UUID participantId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        
        DiagnosticSession session = new DiagnosticSession(participantId, caseId);
        session.setStartedAt(LocalDateTime.now().minusMinutes(2)); // Started 2 mins ago
        
        Case patientCase = new Case();
        patientCase.setPatientPersona("Angry");
        patientCase.setPatientHistory("Smoker");
        patientCase.setPresentingComplaint("Pain");
        patientCase.setLearningObjective("Find the cavity");
        patientCase.setCorrectDiagnosis("Cavity");

        SendMessageRequest request = new SendMessageRequest();
        request.setMessage("Does it hurt to chew?");

        when(diagnosticSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(knowledgeRetrievalService.getRelevantMedicalContext(eq(caseId), anyString())).thenReturn("Medical textbook data about chewing pain.");
        when(caseRepository.findById(caseId)).thenReturn(Optional.of(patientCase));
        
        // Mock Langchain to return a standard ongoing chat JSON
        String mockClaudeResponse = "{\"patientReply\": \"Yes it kills me to chew.\", \"diagnosisFound\": false, \"diagnosis\": null}";
        when(aiPatientService.chatWithStudent(eq(session.getId()), anyString(), anyString(), anyString())).thenReturn(mockClaudeResponse);

        MessageResponse response = diagnosticSessionService.sendMessage(participantId, sessionId, request);

        assertEquals("Yes it kills me to chew.", response.getText());
        assertFalse(response.getCaseCompleted());
        
        // Verify we saved BOTH the student message and the AI message
        verify(messageRepository, times(2)).save(any(Message.class));
    }

    @Test
    void testSendMessage_Success_DiagnosisFound() {
        UUID participantId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        
        DiagnosticSession session = new DiagnosticSession(participantId, caseId);
        session.setStartedAt(LocalDateTime.now().minusMinutes(5));
        
        Case patientCase = new Case();
        patientCase.setCorrectDiagnosis("Cavity");

        SendMessageRequest request = new SendMessageRequest();
        request.setMessage("I think you have a cavity.");

        when(diagnosticSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(knowledgeRetrievalService.getRelevantMedicalContext(eq(caseId), anyString())).thenReturn("");
        when(caseRepository.findById(caseId)).thenReturn(Optional.of(patientCase));
        
        // Mock Langchain to return TRUE for diagnosis found!
        String mockClaudeResponse = "{\"patientReply\": \"Wow you figured it out!\", \"diagnosisFound\": true, \"diagnosis\": \"Cavity\"}";
        when(aiPatientService.chatWithStudent(eq(session.getId()), anyString(), anyString(), anyString())).thenReturn(mockClaudeResponse);

        MessageResponse response = diagnosticSessionService.sendMessage(participantId, sessionId, request);

        assertEquals("Wow you figured it out!", response.getText());
        assertTrue(response.getCaseCompleted());
        
        // Verify session was updated to completed
        verify(diagnosticSessionRepository, times(1)).save(session);
        assertTrue(session.isDiagnosisReached());
        
        // EDGE CASE VERIFICATION:
        // We verify that messageRepository.save() was only called EXACTLY 1 time (for the student's message).
        // It was NOT called a 2nd time for the AI's reply, because caseCompleted is true!
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void testSendMessage_TimeUp() {
        UUID participantId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        
        DiagnosticSession session = new DiagnosticSession(participantId, UUID.randomUUID());
        // Started 15 minutes ago (limit is 10)
        session.setStartedAt(LocalDateTime.now().minusMinutes(15)); 

        SendMessageRequest request = new SendMessageRequest();
        request.setMessage("Are you still there?");

        when(diagnosticSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        MessageResponse response = diagnosticSessionService.sendMessage(participantId, sessionId, request);

        assertEquals("TIME_UP", response.getText());
        assertEquals(SenderRole.SYSTEM, response.getSender());
        // Langchain should never be called!
        verify(aiPatientService, never()).chatWithStudent(any(), any(), any(), any());
    }
}
