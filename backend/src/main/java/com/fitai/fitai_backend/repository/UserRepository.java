package com.fitai.fitai_backend.repository;

import com.fitai.fitai_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByRefreshToken(String refreshToken);
    Optional<User> findByResetToken(String resetToken);
    boolean existsByEmail(String email);
}
