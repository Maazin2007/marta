package com.marta.auth.controller;

import java.util.List;

import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marta.auth.dto.ResearcherLoginRequest;
import com.marta.auth.dto.ResearcherLoginResponse;
import com.marta.auth.model.Participant;
import com.marta.auth.service.ResearcherService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth/researcher")
public class ResearcherController {

    private final ResearcherService researcherService;

    public ResearcherController(ResearcherService researcherService) {
        this.researcherService = researcherService;
    }

    // POST /marta/api/v1/auth/researcher/login
    @PostMapping("/login")
    @RateLimiter(name = "loginLimit")
    public ResponseEntity<ResearcherLoginResponse> loginResearcher(@Valid @RequestBody ResearcherLoginRequest request) {
        return ResponseEntity.ok(researcherService.loginResearcher(request));
    }

    // GET /marta/api/v1/auth/researcher/participants
    @PreAuthorize("hasAuthority('RESEARCHER')")
    @GetMapping("/participants")
    public ResponseEntity<List<Participant>> getParticipants() {
        return ResponseEntity.ok(researcherService.getParticipants());
    }
    // DELETE /marta/api/v1/auth/researcher/participants/{participantId}
    @PreAuthorize("hasAuthority('RESEARCHER')")
    @DeleteMapping("/participants/{participantId}")
    public ResponseEntity<Void> deleteParticipant(@PathVariable String participantId) {
        researcherService.deleteParticipant(participantId);
        return ResponseEntity.noContent().build();
    }
}
