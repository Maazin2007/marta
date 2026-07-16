package com.marta.auth.service;

import com.marta.auth.service.*;
import com.marta.auth.repository.*;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.marta.auth.dto.LoginRequest;
import com.marta.auth.dto.LoginResponse;
import com.marta.auth.dto.RegisterRequest;
import com.marta.auth.dto.RegisterResponse;
import com.marta.auth.dto.ResetPasswordRequest;
import com.marta.auth.dto.ResetPasswordRespone;
import com.marta.auth.model.Participant;
import com.marta.auth.model.ParticipantDemographic;

import jakarta.transaction.Transactional;

@Service
public class ParticipantService {
    private final ParticipantRepository participantRepository;
    private final PasswordEncoder passwordEncoder;
    private final ParticipantDemographicRepository participantDemographicRepository;
    private final JwtService jwtService;
    // @Qualifier tells which bean returning PasswordEncoder type to use which method to use
    public ParticipantService(ParticipantRepository participantRepository, @Qualifier("passwordEncoder") PasswordEncoder passwordEncoder, ParticipantDemographicRepository participantDemographicRepository, JwtService jwtService) {
        this.participantRepository = participantRepository;
        this.passwordEncoder = passwordEncoder;
        this.participantDemographicRepository = participantDemographicRepository;
        this.jwtService = jwtService;
    }

    /**
     * Registers a new participant
     * @param request The request containing the participant's information
     * @return The response containing the participant's ID
     */
    @Transactional
    public RegisterResponse registerParticipant(RegisterRequest request) {
        // generate a new participant ID
        String participantId = generateParticipantId();
        // while the participant ID is already in use, generate a new one
        while (participantRepository.findByParticipantId(participantId) != null) {
            participantId = generateParticipantId();
        }

        // has the password and the pin 
        String passwordHash = passwordEncoder.encode(request.getPassword());
        String pinHash = passwordEncoder.encode(request.getPin());

        // create and save the participant object
        Participant participant = new Participant(participantId, passwordHash, pinHash);
        participantRepository.save(participant);

        // create and save demographic information
        ParticipantDemographic participantDemographic = new ParticipantDemographic(participantId, request.getYearOfStudy(), request.getSex(), request.getSelfReportedConfidence());
        participantDemographicRepository.save(participantDemographic);

        // return the response
        return new RegisterResponse(participantId);
    }

    /**
     * Generates a random participant ID with 8 characters
     * @return The generated participant ID
     */
    private String generateParticipantId() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        // StringBuilder is a mutable sequence of characters efficent way of concatenating strings
        StringBuilder sb = new StringBuilder();
        // SecureRandom over Random because it is more secure and is better practice for applications
        java.security.SecureRandom random = new java.security.SecureRandom();
        for (int i = 0; i < 8; i++) {
            // get random integer between 0 and the length of the chars string
            // and append the character at that index to the StringBuilder
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        // convert the StringBuilder to a String and return it
        return sb.toString();
    }

    /**
     * Logs in a participant
     * @param request The request containing the participant's ID and password
     * @return The response containing the participant's ID and token
     */
    public LoginResponse loginParticipant(LoginRequest request) {
        // find the participant by ID
        Participant participant = participantRepository.findByParticipantId(request.getParticipantId()).orElseThrow(() -> new IllegalArgumentException("Invalid participant ID"));
        // check if the password is correct
        if (!passwordEncoder.matches(request.getPassword(), participant.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid password");
        }
        // generate a JWT oken
        String jwtToken = jwtService.generateTokenWithRole(request.getParticipantId(), "PARTICIPANT");
        // return the response
        return new LoginResponse(request.getParticipantId(), jwtToken);
    }

    /**
     * Resets the password of a participant
     * @param request The request containing the participant's ID, PIN, and new password
     */
    public ResetPasswordRespone resetPassword(ResetPasswordRequest request) {
        // find the participant by ID
        Participant participant = participantRepository.findByParticipantId(request.getParticipantId()).orElseThrow(() -> new IllegalArgumentException("Invalid participant ID"));
        // check if the PIN is correct
        if (!passwordEncoder.matches(request.getPin(), participant.getPinHash())) {
            throw new IllegalArgumentException("Invalid PIN");
        }
        // has the new password
        String newPasswordHash = passwordEncoder.encode(request.getNewPassword());
        // update the participant's password
        participant.setPasswordHash(newPasswordHash);
        participantRepository.save(participant);
        // return the response
        return new ResetPasswordRespone("Password reset successfully");
    }
}