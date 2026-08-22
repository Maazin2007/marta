package com.marta.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import java.util.Arrays;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // inject the JwtAuthenticationFilter
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Argon2PasswordEncoder(16, 32, 1, 1 << 12, 3);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // we allow the requests from the localhost:3000 domain
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        // we allow the following methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // we allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // tell react that we are sending the x-auth-token header so that react can access it
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        // we allow credentials so that react can send the x-auth-token header
        configuration.setAllowCredentials(true);
        // we create a new UrlBasedCorsConfigurationSource object
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // we register the cors configuration for all requests
        source.registerCorsConfiguration("/**", configuration);
        // we return the cors configuration source
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // we get the cors configuration from the corsConfigurationSource bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // we disable the csrf protection because we are not using cookies for authentication
            .csrf(csrf -> csrf.disable())
            // we authorize the requests to the /, /health, and /actuator/health endpoints to be public
            // we authorize the requests to the /auth/** endpoints to be public
            // we authorize the requests to the /error endpoint to be public
            // we authorize all other requests to be authenticated
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/health", "/actuator/health").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated())
            // we set the session creation policy to stateless because we are not using cookies for authentication
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // add the jwtAuthenticationFilter before the UsernamePasswordAuthenticationFilter which is the default filter for username and password authentication provided by Spring Security it requires username and password to authenticate every request
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}