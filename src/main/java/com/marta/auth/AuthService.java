package com.marta.auth;

import com.marta.auth.dto.AuthResponse;
import com.marta.auth.dto.RegisterRequest;
import com.marta.auth.dto.ValidateTokenRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.Repository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    // getting both repos
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;

    @Autowired
    public AuthService(UserRepository userRepository, TokenRepository tokenRepository) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
    }

    // function to return all tokens
    public List<Token> getAllTokens() {
        return tokenRepository.findAll();
    }

    // function to activate specified token
    public Token activateToken(String token) {
        Token t = tokenRepository.findById(token).orElseThrow(() -> new RuntimeException("Token not found"));
        t.setActive(true);
        return tokenRepository.save(t);
    }

    // function to check if the auth is valid
    public AuthResponse validate(ValidateTokenRequest request) {
        // check if the token exists or not
        Token t = tokenRepository.findByToken(request.getToken()).orElse(null);
        // check for null
        if (t == null) {
            return new  AuthResponse(false, false, null, "Token is not valid");
        }
        // check if the token is valid or not
        if (!t.isActive()) {
            return new  AuthResponse(false, false, null, "Token is not active");
        }
        // check if it is claimed
        if (t.getUserId() == null) {
            return new AuthResponse(true, false, null, "ok");
        }
        // check if the studentID matches
        User user = userRepository.findById(t.getUserId()).orElse(null);
        if (user != null && request.getStudentID().equals(user.getStudentId())) {
            return new AuthResponse(true, true, t.getUserId(), "Successfully Logged in");
        } else {
            return new AuthResponse(true, false, null, "ok");
        }
    }

    // function to register the User
    @Transactional // since we have 2 DB operation that need to both be done or both not done
    public Map<String, String> register(RegisterRequest request) {
        // extract the token first and check if its null and valid
        Token t = tokenRepository.findByToken(request.getToken()).orElse(null);
        if (t == null) {
            return Map.of("message", "token not found");
        }
        if (!t.isActive()) {
            return Map.of("message", "Token is not active");
        }
        if (t.getUserId() != null) {
            return Map.of("message", "Token already claimed");
        }
        // create new User
        User user = new User(request.getName(), request.getStudentId(), request.getYearOfStudy(), request.getSex(), request.getSelfReportedConfidence());
        userRepository.save(user);

        // link the token with the student ID
        t.setUserId(user.getId());
        tokenRepository.save(t);
        return Map.of("message", "Successfully registered");
    }
}
