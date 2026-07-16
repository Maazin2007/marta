package com.marta.config;

import com.marta.auth.JwtService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.FilterChain;
import java.io.IOException;
import java.util.ArrayList;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // inject the JwtService
    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    // we are overriding the doFilterInternal method to extract the token from the request and set the authentication in the security context
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // extract the token from the request
        final String authHeader = request.getHeader("Authorization");
        // check if the token is present and starts with Bearer
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        // extract the token
        final String jwtToken = authHeader.substring(7);
        try {
            // extract the participant id from the token
            final String participantId = jwtService.extractParticipantId(jwtToken);
            // check if the participant id is present
            if (participantId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // create the authentication token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(participantId, null, new ArrayList<>());
                // add extra network details to the authentication object
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // set the authentication in the security context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // set the authentication error in the response
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            // tell the browser we are sedingng JSON 
            response.setContentType("application/json");
            // write the custom JSON error message directly in the response
            response.getWriter().write("{\"error\": \"Invalid or expired token\"}");
            // return the response
            return;
        }
        // continue the filter chain
        filterChain.doFilter(request, response);
    }
}
