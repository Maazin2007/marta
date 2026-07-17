package com.marta.auth.repository;

import com.marta.auth.service.*;
import com.marta.auth.repository.*;

import com.marta.auth.model.Researcher;

import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface ResearcherRepository extends CrudRepository<Researcher, UUID> {
    Optional<Researcher> findByEmail(String email);
}
