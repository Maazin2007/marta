package com.marta.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ParticipantRepository extends JpaRepository<Participant, UUID> {
    Optional<Participant> findByParticipantId(UUID participantId);
    boolean existsByParticipantId(UUID participantId);
}
