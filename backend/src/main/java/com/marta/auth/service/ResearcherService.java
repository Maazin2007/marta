package com.marta.auth.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marta.auth.dto.ResearcherLoginRequest;
import com.marta.auth.dto.ResearcherLoginResponse;
import com.marta.auth.model.Participant;
import com.marta.auth.model.Researcher;
import com.marta.auth.repository.ParticipantDemographicRepository;
import com.marta.auth.repository.ParticipantRepository;
import com.marta.auth.repository.ResearcherRepository;

@Service
public class ResearcherService {
    // Injecting the repositories and services
    private final ResearcherRepository researcherRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ParticipantRepository participantRepository;
    private final ParticipantDemographicRepository participantDemographicRepository;
    // Constructor
    public ResearcherService(ResearcherRepository researcherRepository, PasswordEncoder passwordEncoder, JwtService jwtService, ParticipantRepository participantRepository, ParticipantDemographicRepository participantDemographicRepository) {
        this.researcherRepository = researcherRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.participantRepository = participantRepository;
        this.participantDemographicRepository = participantDemographicRepository;
    }
    // Login Researcher
    public ResearcherLoginResponse loginResearcher(ResearcherLoginRequest request) {
        // first we need to try to get the researcher by email
        Researcher researcher = researcherRepository.findByEmail(request.getEmail()).orElseThrow(() -> new IllegalArgumentException("Invalid Email"));
        // then we need to check if the password is correct
        if (!passwordEncoder.matches(request.getPassword(), researcher.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid Password");
        }
        // then we need to comapare the pin code
        if (!passwordEncoder.matches(request.getPin(), researcher.getPinHash())) {
            throw new IllegalArgumentException("Invalid PIN");
        }
        // then we need to generate a JWT token
        String jwtToken = jwtService.generateTokenWithRole(researcher.getId().toString(), "RESEARCHER");
        return new ResearcherLoginResponse(jwtToken);
    }
    // Get Participants
    @Transactional(readOnly = true)
    public List<Participant> getParticipants() {
        return participantRepository.findAll();
    }

    // Delete Participant
    @Transactional
    public void deleteParticipant(String participantId) {
        // first check if the participant exists
        Participant participant = participantRepository.findByParticipantId(participantId).orElseThrow(() -> new IllegalArgumentException("Participant not found"));
        // delete the participant demographic and participant
        participantDemographicRepository.deleteByParticipantID(participantId);
        participantRepository.delete(participant);
    }
}