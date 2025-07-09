package com.example.auth.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;

import com.example.auth.client.NotificationServiceClient;
import com.example.auth.dto.ForgotPasswordDTO;
import com.example.auth.repository.EmployeeRepository;

@Service
public class PasswordResetService {
    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    
    private final NotificationServiceClient notificationClient;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(
            NotificationServiceClient notificationClient, 
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder) {
        this.notificationClient = notificationClient;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void initiatePasswordReset(String email) {
        // Verify email exists in the system
        if (!employeeRepository.existsByEmail(email)) {
            throw new RuntimeException("No account found with email: " + email);
        }

        try {
            notificationClient.initiatePasswordReset(email);
            log.info("Password reset initiated for email: {}", email);
        } catch (Exception e) {
            log.error("Failed to initiate password reset: ", e);
            throw new RuntimeException("Failed to initiate password reset: " + e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(ForgotPasswordDTO resetRequest) {
        if (!resetRequest.getNewPassword().equals(resetRequest.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        try {
            var employee = employeeRepository.findByEmail(resetRequest.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("No account found with email: " + resetRequest.getEmail()));

            // Verify the reset request with notification service first
            notificationClient.resetPassword(resetRequest);

            // Use BCrypt password encoder
            String encodedPassword = passwordEncoder.encode(resetRequest.getNewPassword());
            
            // Verify the password can be matched after encoding
            if (!passwordEncoder.matches(resetRequest.getNewPassword(), encodedPassword)) {
                throw new RuntimeException("Password encoding verification failed");
            }

            employee.setPassword(encodedPassword);
            employeeRepository.save(employee);

            log.info("Password reset completed for email: {}", resetRequest.getEmail());
        } catch (Exception e) {
            log.error("Failed to reset password: ", e);
            throw new RuntimeException("Failed to reset password: " + e.getMessage());
        }
    }
}