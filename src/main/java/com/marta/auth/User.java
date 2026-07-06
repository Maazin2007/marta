package com.marta.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @Column(name = "id",  nullable = false, unique = true)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "student_id", nullable = false, unique = true)
    private String studentId;

    @Column(name="year_of_study", nullable = false)
    private Integer yearOfStudy;

    @Column(name="sex", nullable = false)
    private String sex;

    @Column(name = "self_reported_confidence", nullable = false)
    private Integer selfReportedConfidence;

    @CreationTimestamp
    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    public User(String name, String studentId, Integer yearOfStudy, String sex, Integer selfReportedConfidence) {
        this.name = name;
        this.studentId = studentId;
        this.yearOfStudy = yearOfStudy;
        this.sex = sex;
        this.selfReportedConfidence = selfReportedConfidence;
    }

}
