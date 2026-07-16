package com.marta.auth;

import java.util.HashMap;
import java.util.Date;
import java.security.Key;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    // Injecting the secret key from application.properties
    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    // Generate a JWT token
    public String generateToken(String participantId) {
        return Jwts.builder()
            .setClaims(new HashMap<>()) // claims are the additional data that are stored in the JWT token
            .setSubject(participantId)
            .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    // Get the signing key for the JWT in mathematically secure way for spring boot
    private Key getSignInKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // extract all claims
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSignInKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    // extract a specific claim
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        // each function object has a apply method that takes the claims and returns the type T
        return claimsResolver.apply(claims);
    }

    // extract the participant ID from the JWT token
    public String extractParticipantId(String token) {
        return extractClaim(token, Claims::getSubject);
    }
}
