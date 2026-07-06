package com.marta.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    // optional function to find Student by ID
    Optional<User> findByStudentId(String studentId);
}
