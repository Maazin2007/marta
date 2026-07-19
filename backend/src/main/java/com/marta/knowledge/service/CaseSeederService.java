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
                // CASE 1: Reversible Pulpitis (Beginner)
                // Communication Challenge: Anxious but direct modern Saudi woman
                new Case(
                    "Operative Dentistry", // category
                    "Deep caries with reversible pulpitis", // title
                    "Name: Noura Al-Otaibi. Age: 21. Occupation: Dental hygiene student at King Saud University. " +
                    "Medical History: Healthy, no systemic conditions, no medications, no known allergies. " +
                    "Dental History: Has not visited a dentist in over 3 years despite studying in the dental field. No previous restorations on this tooth. " +
                    "Reports brushing twice a day but rarely flosses. " +
                    "Diet: Drinks sweetened Arabic coffee (qahwa with sugar) multiple times daily. Drinks energy drinks during exam season. Enjoys basbousa and kunafa regularly. " +
                    "Social History: Non-smoker. Lives with her family in Riyadh.", // patientHistory
                    "Sharp sensitivity on the upper left side when drinking cold water or eating ice cream. " +
                    "The pain goes away within 2-3 seconds after the cold stimulus is removed. " +
                    "No spontaneous pain. No pain at night. No pain when biting down. " +
                    "Started noticing the sensitivity about 3 weeks ago and it has stayed the same.", // presentingComplaint
                    "Diagnose reversible pulpitis secondary to deep caries. " +
                    "Demonstrate history-taking skills including thermal stimulus characterization (duration, onset, provocation). " +
                    "Recommend conservative caries excavation and direct restoration.", // learningObjective
                    true, // active
                    "Reversible Pulpitis", // correctDiagnosis
                    "Anxious 21-year-old university student named Noura who is embarrassed because she studies dental hygiene but hasn't visited a dentist herself in years. " +
                    "She is nervous and fidgety in the chair. She apologizes frequently: 'I know I should have come sooner, I'm sorry.' " +
                    "She tends to downplay her pain because she feels ashamed as a dental student. " +
                    "She is direct and open when asked questions — she represents the modern Saudi generation and communicates comfortably. " +
                    "If the student is reassuring and non-judgmental, she opens up more. If they are cold or lecture her, she becomes quiet and withdrawn.", // patientPersona
                    "Beginner" // difficultyLevel
                ),
                // CASE 2: Cracked Tooth Syndrome (Intermediate)
                // Communication Challenge: Stoic, minimizes pain with "Alhamdulillah", impatient businessman
                new Case(
                    "Operative Dentistry",
                    "Cracked tooth syndrome",
                    "Name: Abdulrahman Al-Dosari. Age: 48. Occupation: Business owner (import/export company). " +
                    "Medical History: Type 2 Diabetes managed with Metformin 1000mg twice daily. HbA1c last checked 3 months ago at 7.2%. " +
                    "Controlled hypertension managed with Amlodipine 5mg daily. No known drug allergies. " +
                    "Dental History: Has a large amalgam filling on tooth #30 (lower right first molar) placed approximately 10 years ago. " +
                    "Attends dental check-ups inconsistently — only when something hurts. Reports grinding his teeth at night; his wife has told him he clenches in his sleep. Does not wear a night guard. " +
                    "Social History: Non-smoker. No alcohol. Drinks Arabic coffee (qahwa sada) throughout the day. Eats dates frequently. High-stress lifestyle managing his business.", // patientHistory
                    "Sharp, shooting pain on the lower right side ONLY when biting down on hard food — specifically noticed it with mixed nuts and fresh carrots. " +
                    "The pain is sudden and intense but disappears the moment he stops biting. " +
                    "No pain to hot or cold. No spontaneous pain. No swelling. " +
                    "Has been noticing this for about 6 weeks. It is getting more frequent but he kept delaying the appointment because of work.", // presentingComplaint
                    "Identify cracked tooth syndrome through systematic history-taking about pain characteristics (sharp, on biting, release of pressure). " +
                    "Correlate findings with the existing large amalgam restoration weakening the tooth structure and the reported bruxism. " +
                    "Recommend crown placement to prevent further propagation of the crack.", // learningObjective
                    true,
                    "Cracked Tooth Syndrome",
                    "Busy, no-nonsense 48-year-old Saudi businessman named Abdulrahman (Abu Faisal) who is visibly impatient and wants a quick fix. " +
                    "He is stoic about pain and minimizes it culturally — he will say things like 'Alhamdulillah, it is not that bad' or 'It is just a small thing, yalla let's finish quickly' even when the pain is clearly significant. " +
                    "The student must read between the lines and probe deeper because he will not volunteer how much it truly hurts. " +
                    "He checks his phone during the conversation and may take a call mid-appointment if it rings. He interrupts if questions feel redundant. " +
                    "He gets annoyed by slow or hesitant questioning: 'Brother, can you just tell me what is wrong and fix it?' " +
                    "He respects confidence — if the student speaks with authority and decisiveness, he cooperates fully.", // patientPersona
                    "Intermediate"
                ),
                // CASE 3: Post-restorative sensitivity / Hyperocclusion (Beginner)
                // Communication Challenge: Son answers for her, she defers to authority, agrees with everything
                new Case(
                    "Operative Dentistry",
                    "Post-restorative sensitivity",
                    "Name: Fatimah Al-Harbi (referred to as Um Abdullah by her family). Age: 65. Occupation: Retired, homemaker. " +
                    "Medical History: Type 2 Diabetes managed with Metformin 500mg twice daily and Glimepiride 2mg once daily. HbA1c of 8.1% — not well controlled. " +
                    "Hypertension managed with Losartan 50mg daily. Mild knee osteoarthritis. Vitamin D deficiency (takes supplements). No known drug allergies. " +
                    "Dental History: Had a composite filling placed on tooth #19 (lower left first molar) exactly two weeks ago at this same clinic. " +
                    "Before the filling, there was no pain on this tooth at all. The decay was found during a routine check-up. " +
                    "Social History: Non-smoker. Lives with her son Abdullah and his family. Her son drove her to today's appointment and is sitting in the room with her. " +
                    "She observes Ramadan fasting strictly and is concerned about taking medications during fasting hours.", // patientHistory
                    "A constant dull ache on the lower left side that started the day after the filling was placed two weeks ago. " +
                    "The tooth feels 'too tall' — she says 'when I close my mouth, this tooth hits before the others.' " +
                    "Mild sensitivity when drinking cold water but the main issue is the aching and pressure when she chews. " +
                    "She has been eating only soft foods like jareesh and marqooq on the right side to avoid the pain. Pain is worse when chewing bread or meat.", // presentingComplaint
                    "Recognize that post-operative sensitivity following a direct composite restoration, combined with pain on biting and premature contact, " +
                    "is consistent with hyperocclusion (high bite). " +
                    "Recommend occlusal adjustment with articulating paper to identify and reduce the high spot.", // learningObjective
                    true,
                    "Hyperocclusion",
                    "Sweet, soft-spoken 65-year-old grandmother named Fatimah (Um Abdullah) who does not want to be a burden. " +
                    "CRITICAL: Her son Abdullah is in the room and frequently answers questions on her behalf. When the student asks 'Where does it hurt?', Abdullah jumps in with 'She says it is the lower left.' " +
                    "The student must politely but firmly redirect questions to Fatimah herself to get accurate clinical information. " +
                    "Fatimah minimizes her symptoms: 'Alhamdulillah, it is not so bad, I do not want to make trouble.' 'Maybe it is normal after the filling, no?' " +
                    "She tends to agree with anything the student says even if she does not fully understand, out of respect for their authority as a doctor. If the student asks 'Does it hurt when you bite?', she might say 'Yes, I think so' even if she is unsure. " +
                    "The student needs to ask very specific, closed questions and verify her answers to get the real picture. " +
                    "If the student is patient, gentle, and speaks simply, she becomes much more forthcoming. If they rush her or use jargon, she clams up and lets her son take over.", // patientPersona
                    "Beginner"
                ),
                // CASE 4: Secondary Caries (Intermediate)
                // Communication Challenge: Hides shisha habit, uses humor to deflect, defensive about lifestyle
                new Case(
                    "Operative Dentistry",
                    "Secondary caries beneath a failing restoration",
                    "Name: Sultan Al-Qahtani. Age: 28. Occupation: Graphic designer, works remotely from home. " +
                    "Medical History: Healthy, no systemic conditions, no medications. Mild seasonal allergies (takes over-the-counter antihistamines occasionally). No drug allergies. " +
                    "Dental History: Has an old composite filling on tooth #14 (upper left first premolar) placed about 5 years ago. " +
                    "Admits to inconsistent flossing — maybe once a week. Brushes once a day, usually at night. " +
                    "Diet: Very high sugar intake — puts 3 heaped spoons of sugar in his tea (chai karak), drinks it 4-5 times daily. Snacks on biscuits and chocolate while working. Drinks 2-3 energy drinks per day. " +
                    "Social History: Smokes shisha (hookah) 3-4 times per week with friends at an istiraha, but his family does not know this and he does NOT want it documented. Non-cigarette smoker.", // patientHistory
                    "Food constantly getting stuck between teeth on the upper left side. Has to use a toothpick or miswak after every meal to clear it. " +
                    "Sharp pain when eating anything sweet (chocolate, halwa, sugary tea) on that same tooth. " +
                    "Has noticed the old filling looks darker or brownish around the edges. " +
                    "No pain to hot or cold. No spontaneous pain. No swelling. " +
                    "Has been dealing with this for about 2 months but kept putting off the appointment.", // presentingComplaint
                    "Identify secondary (recurrent) caries at the margin of an existing composite restoration through history-taking. " +
                    "Correlate the food impaction, pain to sweets, and discolored margins as signs of marginal breakdown and recurrent decay. " +
                    "Formulate a treatment plan to remove the failing restoration and decay, and place a new restoration.", // learningObjective
                    true,
                    "Secondary Caries",
                    "Laid-back, slightly sheepish 28-year-old named Sultan who knows his oral hygiene and diet are terrible but absolutely does not want to be lectured about it. " +
                    "He uses humor to deflect: 'Wallah I know, I know, I should stop the sugar... but have you tried chai karak? Impossible to quit.' " +
                    "He gets mildly defensive if the student asks judgmental questions about his diet or hygiene habits. " +
                    "CRITICAL: He smokes shisha regularly but will NOT volunteer this information. If directly asked 'Do you smoke?', he will initially say 'No' (meaning cigarettes). " +
                    "Only if the student specifically asks about shisha/hookah will he reluctantly admit it: 'I mean... shisha sometimes with the guys, but that does not really count, right?' " +
                    "He will then ask the student not to write it down because his family does not know. " +
                    "He is cooperative overall but will shut down if the student sounds preachy or condescending about his lifestyle.", // patientPersona
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
