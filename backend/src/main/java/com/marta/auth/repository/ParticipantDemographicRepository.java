package com.marta.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marta.auth.model.ParticipantDemographic;

public interface ParticipantDemographicRepository extends JpaRepository<ParticipantDemographic, UUID> {
    Optional<ParticipantDemographic> findByParticipantID(String participantID);
    void deleteByParticipantID(String participantID);
}
