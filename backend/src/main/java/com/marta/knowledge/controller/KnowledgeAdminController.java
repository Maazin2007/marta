package com.marta.knowledge.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import com.marta.knowledge.service.PdfIngestionService;

import com.marta.knowledge.model.Case;
import com.marta.knowledge.repository.CaseRepository;

import java.util.List;

@RestController
@RequestMapping("/admin/knowledge")
public class KnowledgeAdminController {

    private final PdfIngestionService pdfIngestionService;
    private final CaseRepository caseRepository;

    public KnowledgeAdminController(PdfIngestionService pdfIngestionService, CaseRepository caseRepository) {
        this.pdfIngestionService = pdfIngestionService;
        this.caseRepository = caseRepository;
    }

    // NEW ROUTE: Fetch all cases for the React Dropdown
    @GetMapping("/cases")
    @PreAuthorize("hasAuthority('RESEARCHER')")
    public ResponseEntity<List<Case>> getAllCases() {
        return ResponseEntity.ok(caseRepository.findAll());
    }

    @PostMapping("/ingest")
    @PreAuthorize("hasAuthority('RESEARCHER')")
    public ResponseEntity<String> ingestPdf(@RequestParam("file") MultipartFile file, @RequestParam(value = "caseId", required = false) java.util.UUID caseId, @RequestParam("category") String category) {
        try {
            String result = pdfIngestionService.ingestPdf(file, caseId, category);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error ingesting PDF: " + e.getMessage());
        }
    }
}
