package com.marta.knowledge.service;

import com.marta.knowledge.model.Case;
import com.marta.knowledge.repository.CaseRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CaseSeederService {

    private final CaseRepository caseRepository;

    // Inject the repository via constructor
    public CaseSeederService(CaseRepository caseRepository) {
        this.caseRepository = caseRepository;
    }

    @PostConstruct
    public void seedCases() {
        if (caseRepository.count() == 0) {
            System.out.println("🦷 No clinical cases found in DB. Seeding the 4 scenarios...");

            List<Case> casesToSeed = List.of(
                // CASE 1
                new Case(
                    "Operative Dentistry", // category
                    "Deep caries with reversible pulpitis", // title
                    "No previous restorations on this tooth. Brushes twice a day.", // patientHistory
                    "Extreme sensitivity to cold drinks lasting 2-3 seconds.", // presentingComplaint
                    "Diagnose reversible pulpitis and recommend conservative excavation.", // learningObjective
                    true, // active
                    "Reversible Pulpitis", // correctDiagnosis
                    "Anxious 22-year-old college student who hates the dentist.", // patientPersona
                    "Beginner" // difficultyLevel
                ),
                // CASE 2
                new Case(
                    "Operative Dentistry",
                    "Cracked tooth syndrome",
                    "Has a large, 10-year-old amalgam filling on the lower right.",
                    "Sharp, shooting pain only when biting down on hard food.",
                    "Identify the crack using bite testing and recommend a crown.",
                    true,
                    "Cracked Tooth Syndrome",
                    "Busy 45-year-old executive who is annoyed by the pain and wants a quick fix.",
                    "Intermediate"
                ),
                // CASE 3
                new Case(
                    "Operative Dentistry",
                    "Post-restorative sensitivity",
                    "Had a composite filling placed two weeks ago.",
                    "Constant dull ache and sensitivity when drinking cold water.",
                    "Determine if the pain is from hyperocclusion or a bonding failure.",
                    true,
                    "Hyperocclusion",
                    "Polite 60-year-old grandmother who feels bad complaining.",
                    "Beginner"
                ),
                // CASE 4
                new Case(
                    "Operative Dentistry",
                    "Secondary caries beneath a failing restoration",
                    "Has an old composite filling that has turned brown at the edges.",
                    "Food keeps getting stuck between my teeth, and it hurts when I eat sweets.",
                    "Identify recurrent decay and formulate a treatment plan to replace the restoration.",
                    true,
                    "Secondary Caries",
                    "30-year-old who admits they don't floss often.",
                    "Intermediate"
                )
            );

            caseRepository.saveAll(casesToSeed);
            System.out.println("✅ Seeded 4 clinical cases successfully!");
        } else {
            System.out.println("✅ Clinical cases already exist in DB. Skipping seeder.");
        }
    }
}
