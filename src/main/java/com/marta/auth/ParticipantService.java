package com.marta.auth;

import com.marta.auth.dto.RegisterRequest;
import com.marta.auth.dto.RegisterResponse;
import com.marta.auth.dto.Sex;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ParticipantService {
    private final ParticipantRepository participantRepository;
    private final PasswordEncoder passwordEncoder;

    // @Qualifier tells which bean returning PasswordEncoder type to use which method to use
    public ParticipantService(ParticipantRepository participantRepository, @Qualifier("passwordEncoder") PasswordEncoder passwordEncoder) {
        this.participantRepository = participantRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ResponseEntity<RegisterResponse> registerParticipant(RegisterRequest request) {
        // extract all the data from the request object
        Integer yearOfStudy = request.getYearOfStudy();
        Sex sex = request.getSex();
        Double selfReportedConfidence = request.getSelfReportedConfidence();
        String password = request.getPassword();
        String pin = request.getPin();

        // verify the content
        if (password.length() < 6) { return null; }
        if (pin.length() != 6) { return null; }
        if (0 <= selfReportedConfidence && selfReportedConfidence < 1) { return null; }
        // hash the pin and the password
        // create a new Participant object
        Participant participant = new Participant();
    }
}
