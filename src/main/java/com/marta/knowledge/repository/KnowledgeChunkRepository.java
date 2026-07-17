package com.marta.knowledge.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.marta.knowledge.model.KnowledgeChunk;

public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, UUID> {
    // we dont need Optional because we are returning a List so it will be empty if not found not null
    // Finds all chunks related to a specific case
    List<KnowledgeChunk> findByCaseId(UUID caseId);
    
    // Finds all universal chunks (where caseId is null)
    List<KnowledgeChunk> findByCaseIdIsNull();

    // Note: When we hook up the pgvector extension in Block 4, 
    // we will add our custom mathematical vector-search SQL queries here!
    @Query(value = """
            WITH semantic_search AS (
                SELECT id, content, embedding <-> CAST(:queryEmbedding AS vector) AS vector_score
                FROM knowledge_chunks
                WHERE (case_id = :caseId OR case_id IS NULL) AND deleted_at IS NULL
                ORDER BY vector_score ASC
                LIMIT 20
            ),
            keyword_search AS (
                SELECT id, ts_rank_cd(to_tsvector('english', content), plainto_tsquery('english', :queryText)) AS keyword_score
                FROM knowledge_chunks
                WHERE (case_id = :caseId OR case_id IS NULL) AND deleted_at IS NULL
                ORDER BY keyword_score DESC
                LIMIT 20
            )
            SELECT k.*
            FROM knowledge_chunks k
            LEFT JOIN semantic_search s ON k.id = s.id
            LEFT JOIN keyword_search w ON k.id = w.id
            WHERE s.id IS NOT NULL OR w.id IS NOT NULL -- at least one search result must be found
            -- native query so we can send raw SQL queries to the database no JPAQL
            """, nativeQuery = true)
            List<KnowledgeChunk> findTopChunksHybrid(                                                             
                @Param("caseId") UUID caseId,                                                                 
                @Param("queryText") String queryText,                                                         
                @Param("queryEmbedding") float[] queryEmbedding // Changed to match your Entity!
            );   
}
