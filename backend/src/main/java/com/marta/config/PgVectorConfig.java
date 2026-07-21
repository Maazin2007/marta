package com.marta.config;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class PgVectorConfig {

    private final EntityManager entityManager;
    private final TransactionTemplate transactionTemplate;

    public PgVectorConfig(EntityManager entityManager, TransactionTemplate transactionTemplate) {
        this.entityManager = entityManager;
        this.transactionTemplate = transactionTemplate;
    }

    @PostConstruct
    public void enablePgVectorExtension() {
        transactionTemplate.executeWithoutResult(status ->
            entityManager.createNativeQuery("CREATE EXTENSION IF NOT EXISTS vector").executeUpdate()
        );
    }
}
