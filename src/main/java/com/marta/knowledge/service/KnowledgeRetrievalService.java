package com.marta.knowledge.service;

import com.marta.knowledge.model.KnowledgeChunk;
import com.marta.knowledge.repository.KnowledgeChunkRepository;
import dev.langchain4j.model.embedding.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class KnowledgeRetrievalService {

    private final KnowledgeChunkRepository knowledgeChunkRepository;
    private final EmbeddingModel embeddingModel;

    public KnowledgeRetrievalService(KnowledgeChunkRepository knowledgeChunkRepository) {
        this.knowledgeChunkRepository = knowledgeChunkRepository;
        this.embeddingModel = new AllMiniLmL6V2EmbeddingModel();
    }

    public String getRelevantMedicalContext(UUID caseId, String studentQuestion) {
        
        // 1. Embed the student's question into math
        float[] questionVector = embeddingModel.embed(studentQuestion).content().vector();
        
        // 2. Ask Postgres to run the Hybrid Search + RRF Math!
        List<KnowledgeChunk> bestChunks = knowledgeChunkRepository.findTopChunksHybrid(
                caseId, 
                studentQuestion, 
                questionVector
        );
        
        // 3. We only want to feed Claude the absolute top 3 most relevant paragraphs
        return bestChunks.stream()
                .limit(3)
                .map(KnowledgeChunk::getContent)
                .collect(Collectors.joining("\n\n---\n\n"));
    }
}
