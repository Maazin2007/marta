package com.marta.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ParticipantDemographicRepository extends JpaRepository<ParticipantDemographic, UUID> {
    Optional<ParticipantDemographic> findByParticipantID(String participantID);
}
