package com.marta.auth;

import com.marta.auth.dto.AuthResponse;
import com.marta.auth.dto.RegisterRequest;
import com.marta.auth.dto.ValidateTokenRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("api/v1")
public class AuthController {
    // getting the auth service
    private final AuthService authService;

    // Constructor
    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // token routers for researchers
    @GetMapping("/tokens")
    public List<Token> getTokens() {
        return authService.getAllTokens();
    }

    @PatchMapping("/token/{token}/activate")
    public ResponseEntity<Map<String, String>> activateToken(@PathVariable String token) {
        try {
            Token t = authService.activateToken(token);
            return ResponseEntity.ok().body(Map.of("token", t.getToken(), "status", "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", "token does not exist in DB", "status", "failed"));
        }
    }

    // student routes for registration
    @PostMapping("auth/validate")
    public ResponseEntity<AuthResponse> validateToken(@RequestBody ValidateTokenRequest request) {
        // extract all the token and studentID
        AuthResponse res = authService.validate(request);
        int status = res.isSuccess() ? 200 : 401;
        return ResponseEntity.status(status).body(res);
    }

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        Map<String, String> res = authService.register(request);
        if (res.get("message").equals("Successfully registered")) {
            return ResponseEntity.status(201).body(res);
        } else {
            return ResponseEntity.status(400).body(res);
        }
    }


}
