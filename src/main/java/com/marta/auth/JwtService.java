package com.marta.auth;

import java.util.HashMap;
import java.util.Date;
import java.security.Key;
import java.util.function.Function;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    // secret key for the JWT 32 characters long
    private static final String SECRET_KEY = "01234567890123456789012345678901";

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
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
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
        // each function object has a apply method that takes the argument and returns the result
        return claimsResolver.apply(claims);
    }

    // extract the participant ID from the JWT token
    public String extractParticipantId(String token) {
        return extractClaim(token, Claims::getSubject);
    }
}
