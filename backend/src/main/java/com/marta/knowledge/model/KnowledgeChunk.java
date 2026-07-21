package com.marta.knowledge.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.Array;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "knowledge_chunks")
@Data
@NoArgsConstructor
public class KnowledgeChunk {
    // primary key ID is a UUID
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // case ID is a UUID
    @Column(name = "case_id", updatable = true, nullable = true)
    private UUID caseId; // if null, it applies to all cases!

    // This is the actual text of the knowledge chunk
    @Column(name = "content", updatable = true, nullable = false)
    private String content;

    // This will hold our pgvector mathematical array for the embedding!
    @JdbcTypeCode(SqlTypes.VECTOR)
    @Array(length = 384)
    @Column(name = "embedding", updatable = true, nullable = false)
    private float[] embedding;

    // Source of the knowledge chunk
    @Column(name = "source", updatable = true, nullable = false)
    private String source;

    // category of the knowledge chunk
    @Column(name = "category", updatable = true, nullable = false)
    private String category;

    // created at is a timestamp
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    // deleted at is a timestamp (soft delete)
    @Column(name = "deleted_at", updatable = true, nullable = true)
    private LocalDateTime deletedAt = null;

    // WORLD-CLASS AI METADATA: 
    // chunk_index: Helps the AI know the order of paragraphs (e.g. if it reads chunk 5, it might need chunk 6 for more context)
    @Column(name = "chunk_index", updatable = true, nullable = true)
    private Integer chunkIndex;

    // token_count: Helps us track how much space this chunk will take up in the AI's "brain" (context window)
    @Column(name = "token_count", updatable = true, nullable = true)
    private Integer tokenCount;
    
    public KnowledgeChunk(String content, float[] embedding, UUID caseId, String source, String category, Integer chunkIndex, Integer tokenCount) {
        this.content = content;
        this.embedding = embedding;
        this.caseId = caseId;
        this.source = source;
        this.category = category;
        this.chunkIndex = chunkIndex;
        this.tokenCount = tokenCount;
        // createdAt is automatically handled by @CreationTimestamp, but we can set it here too if needed
        this.deletedAt = null; // explicitly set default to null
    }
}
