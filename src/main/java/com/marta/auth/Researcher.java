package com.marta.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "researchers")
@NoArgsConstructor
@Getter
@Setter
public class Researcher {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id",  nullable = false, updatable = false)
    private UUID id;

    @Column(name = "email", unique = true, nullable = false, updatable = true)
    private String email;

    @Column(name = "password_hash", unique = false, nullable = false, updatable = true)
    private String passwordHash;

    @Column(name = "pin_hash", updatable = true, nullable = false)
    private String pinHash;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    public Researcher(String email, String passwordHash, String pinHash) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.pinHash = pinHash;
    }

}
