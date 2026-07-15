package com.marta.auth;

import com.marta.auth.dto.Sex;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "participants_demographics")
@NoArgsConstructor
@Getter
@Setter
public class ParticipantDemographic {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id", updatable = false, nullable = false)
    private UUID id;

    // table can only hold one participant ID
    @Column(name="participant_id",  unique = true, updatable = false, nullable = false)
    private String participantID;

    @Column(name="year_of_study", updatable = false, nullable = false)
    private Integer yearOfStudy;

    @Enumerated(EnumType.STRING)
    @Column(name = "sex", nullable = false, updatable = false)
    private Sex sex;

    @Column(name="self_reported_confidence", updatable = false, nullable = false)
    private Double selfReportedConfidence;

    @CreationTimestamp
    @Column(name="created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    public ParticipantDemographic(String participantID, Integer yearOfStudy, Sex sex, Double selfReportedConfidence) {
        this.participantID = participantID;
        this.yearOfStudy = yearOfStudy;
        this.sex = sex;
        this.selfReportedConfidence = selfReportedConfidence;
    }

}
