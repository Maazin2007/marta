package com.marta.auth;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipantRepository extends JpaRepository<Participant, UUID> {
    Optional<Participant> findByParticipantId(String participantId);
    boolean existsByParticipantId(String participantId);
}
