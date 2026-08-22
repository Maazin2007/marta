package com.marta.auth.service;

import com.marta.auth.dto.ResearcherLoginRequest;
import com.marta.auth.dto.ResearcherLoginResponse;
import com.marta.auth.model.Participant;
import com.marta.auth.model.Researcher;
import com.marta.auth.repository.ParticipantDemographicRepository;
import com.marta.auth.repository.ParticipantRepository;
import com.marta.auth.repository.ResearcherRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ResearcherServiceTest {

    @Mock
    private ResearcherRepository researcherRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtService jwtService;
    
    @Mock
    private ParticipantRepository participantRepository;
    
    @Mock
    private ParticipantDemographicRepository participantDemographicRepository;

    @InjectMocks
    private ResearcherService researcherService;

    // ==========================================
    // LOGIN TESTS
    // ==========================================

    @Test
    void testLogin_Success() {
        ResearcherLoginRequest request = new ResearcherLoginRequest();
        request.setEmail("doctor@marta.com");
        request.setPassword("MySecretPass");
        request.setPin("1234");
        Researcher researcher = new Researcher();
        researcher.setId(UUID.randomUUID());
        researcher.setEmail("doctor@marta.com");
        researcher.setPasswordHash("hashed_pass");
        researcher.setPinHash("hashed_pin");

        // Mock dependencies
        when(researcherRepository.findByEmail("doctor@marta.com")).thenReturn(Optional.of(researcher));
        when(passwordEncoder.matches("MySecretPass", "hashed_pass")).thenReturn(true);
        when(passwordEncoder.matches("1234", "hashed_pin")).thenReturn(true);
        when(jwtService.generateTokenWithRole(researcher.getId().toString(), "RESEARCHER")).thenReturn("mock-jwt-token");

        ResearcherLoginResponse response = researcherService.loginResearcher(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
    }

    @Test
    void testLogin_InvalidEmail() {
        ResearcherLoginRequest request = new ResearcherLoginRequest();
        request.setEmail("wrong@marta.com");
        request.setPassword("pass");
        request.setPin("pin");
        
        when(researcherRepository.findByEmail("wrong@marta.com")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            researcherService.loginResearcher(request);
        });
        assertEquals("Invalid Email", exception.getMessage());
    }

    @Test
    void testLogin_InvalidPassword() {
        ResearcherLoginRequest request = new ResearcherLoginRequest();
        request.setEmail("doctor@marta.com");
        request.setPassword("WrongPass");
        request.setPin("1234");
        Researcher researcher = new Researcher();
        researcher.setPasswordHash("hashed_pass");
        
        when(researcherRepository.findByEmail("doctor@marta.com")).thenReturn(Optional.of(researcher));
        when(passwordEncoder.matches("WrongPass", "hashed_pass")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            researcherService.loginResearcher(request);
        });
        assertEquals("Invalid Password", exception.getMessage());
    }

    @Test
    void testLogin_InvalidPin() {
        ResearcherLoginRequest request = new ResearcherLoginRequest();
        request.setEmail("doctor@marta.com");
        request.setPassword("MySecretPass");
        request.setPin("WrongPin");
        Researcher researcher = new Researcher();
        researcher.setPasswordHash("hashed_pass");
        researcher.setPinHash("hashed_pin");
        
        when(researcherRepository.findByEmail("doctor@marta.com")).thenReturn(Optional.of(researcher));
        when(passwordEncoder.matches("MySecretPass", "hashed_pass")).thenReturn(true);
        when(passwordEncoder.matches("WrongPin", "hashed_pin")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            researcherService.loginResearcher(request);
        });
        assertEquals("Invalid PIN", exception.getMessage());
    }

    // ==========================================
    // GET PARTICIPANTS TESTS
    // ==========================================

    @Test
    void testGetParticipants_Success() {
        Participant p1 = new Participant();
        Participant p2 = new Participant();
        List<Participant> mockList = Arrays.asList(p1, p2);

        when(participantRepository.findAll()).thenReturn(mockList);

        List<Participant> result = researcherService.getParticipants();

        assertEquals(2, result.size());
        verify(participantRepository, times(1)).findAll();
    }

    // ==========================================
    // DELETE PARTICIPANT TESTS
    // ==========================================

    @Test
    void testDeleteParticipant_Success() {
        String targetId = "P1234567";
        Participant participant = new Participant();
        participant.setParticipantId(targetId);

        when(participantRepository.findByParticipantId(targetId)).thenReturn(Optional.of(participant));

        researcherService.deleteParticipant(targetId);

        // Verify the cascading deletes actually happen in the correct order
        verify(participantDemographicRepository, times(1)).deleteByParticipantID(targetId);
        verify(participantRepository, times(1)).delete(participant);
    }

    @Test
    void testDeleteParticipant_NotFound() {
        String targetId = "P9999999";
        
        when(participantRepository.findByParticipantId(targetId)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            researcherService.deleteParticipant(targetId);
        });
        
        assertEquals("Participant not found", exception.getMessage());
        
        // Edge Case: Guarantee that if the user isn't found, we don't accidentally delete someone else!
        verify(participantDemographicRepository, never()).deleteByParticipantID(any());
        verify(participantRepository, never()).delete(any());
    }
}
