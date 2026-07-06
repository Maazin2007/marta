package com.marta.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.util.Map;

@RestController
public class HealthController {
    private final DataSource dataSource;
    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    // Index route
    @GetMapping("/")
    public Map<String, String> index() {
        return Map.of("message", "Welcome to the marta API!");
    }
    // health route with database check
    @GetMapping("/health")
    public Map<String, String> health() {
        try {
            dataSource.getConnection().isValid(1);
            return Map.of("status", "ok", "database", "connected");
        } catch (Exception e) {
            return Map.of("status", "ok", "database", "Not connected");
        }
    }
}


