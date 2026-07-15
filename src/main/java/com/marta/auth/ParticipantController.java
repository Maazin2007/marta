package com.marta.auth;

import com.marta.auth.dto.RegisterRequest;
import com.marta.auth.dto.RegisterResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("/participants")
public class ParticipantController {
    // get the Service Class for this controller
    private final ParticipantService participantService;

    @Autowired
    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    //***************************************************** Routes **********************************************************
    // POST marta/api/v1/participants/register
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> registerParticipant(@RequestBody RegisterRequest request) {
        return participantService.registerParticipant(request);
    }


}
