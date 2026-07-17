package com.marta.knowledge.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.marta.knowledge.model.KnowledgeChunk;
import com.marta.knowledge.repository.KnowledgeChunkRepository;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;

import java.util.List;
import java.util.UUID;

@Service
public class PdfIngestionService {

    private final KnowledgeChunkRepository knowledgeChunkRepository;
    private final EmbeddingModel embeddingModel;   

    public PdfIngestionService(KnowledgeChunkRepository knowledgeChunkRepository) {
        this.knowledgeChunkRepository = knowledgeChunkRepository;
        this.embeddingModel = new AllMiniLmL6V2EmbeddingModel();
    }

    public String ingestPdf(MultipartFile file, UUID caseId, String category) throws Exception {
        // check if file is empty
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        // We read diretly from the web upload stream no hard disk!
        ApachePdfBoxDocumentParser parser = new ApachePdfBoxDocumentParser();
        Document document = parser.parse(file.getInputStream());

        // CHUNK THE DOCUMENT 500 characters per chunk, 50 characters overlap
        List<TextSegment> chunks = DocumentSplitters.recursive(500, 50).split(document);

        // INGEST THE CHUNKS
        int chunkIndex = 0;
        for (TextSegment chunk : chunks) {
            // get the embedding for the chunk
            float[] vectorMath = embeddingModel.embed(chunk.text()).content().vector();      // this returns a float array

            // CREATE A NEW CHUNK ENTITY
            KnowledgeChunk dbChunk = new KnowledgeChunk(                                                  
                chunk.text(),                                                                         
                vectorMath,                                                                           
                caseId, // If this is null, it's a global textbook!                                   
                file.getOriginalFilename(),                                                                    
                category,                                                                             
                chunkIndex,                                                                           
                chunk.text().length() // token count approximation                                    
            );

            // SAVE THE CHUNK TO THE DATABASE
            knowledgeChunkRepository.save(dbChunk);

            chunkIndex++;
        }

        return "Successfully ingested " + chunks.size() + " chunks from " + file.getOriginalFilename();
    }
        
}
