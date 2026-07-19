package com.marta.knowledge.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cases")
@Data
@NoArgsConstructor
public class Case {
    // primary key ID is a UUID
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    // category is a string
    @Column(name = "category", updatable = true, nullable = false)
    private String category;

    // title is a string
    @Column(name = "title", updatable = true, nullable = false)
    private String title;

    // patient history is a string
    @Column(name = "patient_history", updatable = true, nullable = false)
    private String patientHistory;

    // presenting complaint is a string
    @Column(name = "presenting_complaint", updatable = true, nullable = false)
    private String presentingComplaint;

    // learning objective is a string
    @Column(name = "learning_objective", updatable = true, nullable = false)
    private String learningObjective;

    // active is a boolean
    @Column(name = "active", updatable = true, nullable = false)
    private boolean active;

    // The exact diagnosis the student needs to reach
    @Column(name = "correct_diagnosis", updatable = true, nullable = false)
    private String correctDiagnosis;

    // The personality of the AI patient
    @Column(name = "patient_persona", updatable = true, nullable = false)
    private String patientPersona;

    // The difficulty level for researcher metrics (e.g. "Beginner", "Intermediate", "Advanced")
    @Column(name = "difficulty_level", updatable = true, nullable = false)
    private String difficultyLevel;

    public Case(String category, String title, String patientHistory, String presentingComplaint, String learningObjective, boolean active, String correctDiagnosis, String patientPersona, String difficultyLevel) {
        this.category = category;
        this.title = title;
        this.patientHistory = patientHistory;
        this.presentingComplaint = presentingComplaint;
        this.learningObjective = learningObjective;
        this.active = active;
        this.correctDiagnosis = correctDiagnosis;
        this.patientPersona = patientPersona;
        this.difficultyLevel = difficultyLevel;
    }
}
