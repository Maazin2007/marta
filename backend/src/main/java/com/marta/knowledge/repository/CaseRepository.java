package com.marta.knowledge.repository;

import com.marta.knowledge.model.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

import org.springframework.cache.annotation.Cacheable;
import java.util.List;

public interface CaseRepository extends JpaRepository<Case, UUID> {
    // cache the results of the findAll method
    @Override
    @Cacheable("cases") 
    List<Case> findAll();
}
