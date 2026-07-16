package com.marta.auth;

import com.marta.auth.dto.LoginRequest;
import com.marta.auth.dto.LoginResponse;
import com.marta.auth.dto.RegisterRequest;
import com.marta.auth.dto.RegisterResponse;
import com.marta.auth.dto.ResetPasswordRequest;
import com.marta.auth.dto.ResetPasswordRespone;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;


@RestController()
@RequestMapping("/auth")
public class ParticipantController {
    // get the Service Class for this controller
    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    //***************************************************** Routes **********************************************************
    // POST marta/api/v1/auth/register
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> registerParticipant(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(participantService.registerParticipant(request));
    }

    // POST marta/api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginParticipant(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(participantService.loginParticipant(request));
    }

    // POST marta/api/v1/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<ResetPasswordRespone> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(participantService.resetPassword(request));
    }
}
