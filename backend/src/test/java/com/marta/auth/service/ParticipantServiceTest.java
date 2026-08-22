package com.marta.auth.service;

import com.marta.auth.dto.LoginRequest;
import com.marta.auth.dto.LoginResponse;
import com.marta.auth.dto.RegisterRequest;
import com.marta.auth.dto.RegisterResponse;
import com.marta.auth.dto.ResetPasswordRequest;
import com.marta.auth.dto.ResetPasswordRespone;
import com.marta.auth.dto.Sex;
import com.marta.auth.model.Participant;
import com.marta.auth.model.ParticipantDemographic;
import com.marta.auth.repository.ParticipantDemographicRepository;
import com.marta.auth.repository.ParticipantRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ParticipantServiceTest {

    @Mock
    private ParticipantRepository participantRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private ParticipantDemographicRepository participantDemographicRepository;
    
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private ParticipantService participantService;

    // ==========================================
    // LOGIN TESTS
    // ==========================================

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("P1234567", "MySecretPassword");
        Participant participant = new Participant("P1234567", "hashed_password_string", "1234");
        participant.setId(UUID.randomUUID());

        // Setup mock dependencies
        when(participantRepository.findByParticipantId("P1234567")).thenReturn(Optional.of(participant));
        when(passwordEncoder.matches("MySecretPassword", "hashed_password_string")).thenReturn(true);
        when(jwtService.generateTokenWithRole(participant.getId().toString(), "PARTICIPANT")).thenReturn("fake-jwt-token-string");

        LoginResponse response = participantService.loginParticipant(request);

        assertNotNull(response);
        assertEquals("fake-jwt-token-string", response.getToken());
        assertEquals("P1234567", response.getParticipantId());
    }

    @Test
    void testLogin_UserNotFound() {
        LoginRequest request = new LoginRequest("P9999999", "password");
        
        when(participantRepository.findByParticipantId("P9999999")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            participantService.loginParticipant(request);
        });
        assertEquals("Invalid participant ID", exception.getMessage());
    }

    @Test
    void testLogin_WrongPassword() {
        LoginRequest request = new LoginRequest("P1234567", "WrongPassword");
        Participant participant = new Participant("P1234567", "hashed_password_string", "1234");
        
        when(participantRepository.findByParticipantId("P1234567")).thenReturn(Optional.of(participant));
        when(passwordEncoder.matches("WrongPassword", "hashed_password_string")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            participantService.loginParticipant(request);
        });
        assertEquals("Invalid password", exception.getMessage());
    }

    // ==========================================
    // REGISTER TESTS
    // ==========================================

    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest(1, Sex.MALE, 0.5, "MyPassword", "123456");
        
        when(participantRepository.existsByParticipantId(anyString())).thenReturn(false); 
        when(passwordEncoder.encode("MyPassword")).thenReturn("hashed_password_string");
        when(passwordEncoder.encode("123456")).thenReturn("hashed_pin_string");

        RegisterResponse response = participantService.registerParticipant(request);

        assertNotNull(response);
        assertNotNull(response.getParticipantId()); 
        
        // Verify database save operations
        verify(participantRepository, times(1)).save(any(Participant.class));
        verify(participantDemographicRepository, times(1)).save(any(ParticipantDemographic.class));
    }

    @Test
    void testRegister_IdCollisionRetry() {
        // Edge Case: Validate retry logic if the generated ID is already in use
        RegisterRequest request = new RegisterRequest(1, Sex.MALE, 0.5, "MyPassword", "123456");
        
        // Mock a collision on the first attempt, success on the second
        when(participantRepository.existsByParticipantId(anyString())).thenReturn(true, false); 
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_string");

        RegisterResponse response = participantService.registerParticipant(request);

        assertNotNull(response);
        // Ensure the collision loop triggered exactly twice
        verify(participantRepository, times(2)).existsByParticipantId(anyString());
    }

    // ==========================================
    // RESET PASSWORD TESTS
    // ==========================================

    @Test
    void testResetPassword_Success() {
        ResetPasswordRequest request = new ResetPasswordRequest("P123", "1234", "NewPass");
        Participant participant = new Participant("P123", "old_hash_pass", "hash_pin");
        
        when(participantRepository.findByParticipantId("P123")).thenReturn(Optional.of(participant));
        when(passwordEncoder.matches("1234", "hash_pin")).thenReturn(true);
        when(passwordEncoder.encode("NewPass")).thenReturn("new_hash_pass");

        ResetPasswordRespone response = participantService.resetPassword(request);
        
        assertEquals("Password reset successfully", response.getMessage());
        // Verify the updated participant entity was persisted
        verify(participantRepository, times(1)).save(participant);
    }

    @Test
    void testResetPassword_WrongPin() {
        ResetPasswordRequest request = new ResetPasswordRequest("P123", "WrongPin", "NewPass");
        Participant participant = new Participant("P123", "hash_pass", "hash_pin");
        
        when(participantRepository.findByParticipantId("P123")).thenReturn(Optional.of(participant));
        when(passwordEncoder.matches("WrongPin", "hash_pin")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            participantService.resetPassword(request);
        });
        assertEquals("Invalid PIN", exception.getMessage());
    }
}
