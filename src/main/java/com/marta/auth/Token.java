package com.marta.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;


@Entity
@Table(name = "tokens")
@Getter
@Setter
@NoArgsConstructor
public class Token {
    // table columns
    @Id
    @Column(name = "token", nullable = false, unique = true)
    private String token;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // constructor
    public Token(String token) {
        this.token = token;
    }


}
