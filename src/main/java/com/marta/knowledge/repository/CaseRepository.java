package com.marta.knowledge.repository;

import com.marta.knowledge.model.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CaseRepository extends JpaRepository<Case, UUID> {
    boolean existsByCaseNumber(Integer caseNumber);
}
