package com.marta.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "participants")
@Getter
@Setter
@NoArgsConstructor
public class Participant {
    // primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id", updatable = false, nullable = false)
    private UUID id;
    // The participant ID this has to be unique
    @Column(name="participant_id", unique = true, updatable = false, nullable = false)
    private String participantId;

    @Column(name="password_hash", updatable = true, nullable = false)
    private String passwordHash;

    @Column(name="pin_hash", updatable = true, nullable = false)
    private String pinHash;

    @CreationTimestamp
    @Column(name="created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    // Custom Constructor
    public Participant(String participantId, String passwordHash, String pinHash) {
        this.participantId = participantId;
        this.passwordHash = passwordHash;
        this.pinHash = pinHash;
    }

}
