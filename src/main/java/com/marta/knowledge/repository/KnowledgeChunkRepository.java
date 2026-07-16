package com.marta.knowledge.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marta.knowledge.model.KnowledgeChunk;

public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, UUID> {
    // we dont need Optional because we are returning a List so it will be empty if not found not null
    // Finds all chunks related to a specific case
    List<KnowledgeChunk> findByCaseId(UUID caseId);
    
    // Finds all universal chunks (where caseId is null)
    List<KnowledgeChunk> findByCaseIdIsNull();

    // Note: When we hook up the pgvector extension in Block 4, 
    // we will add our custom mathematical vector-search SQL queries here!
}
