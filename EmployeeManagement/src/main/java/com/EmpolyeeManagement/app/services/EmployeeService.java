package com.EmpolyeeManagement.app.services;

import com.EmpolyeeManagement.app.dto.OtpVerificationDTO;
import com.EmpolyeeManagement.app.dto.PasswordChangeDTO;
import com.EmpolyeeManagement.app.model.Employee;
import com.EmpolyeeManagement.app.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.EmpolyeeManagement.app.client.NotificationServiceClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationServiceClient notificationServiceClient;

    public Employee getByEmployeeId(Long employeeId) {
        return employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with employeeId: " + employeeId));
    }

    public Employee updateByEmployeeId(Long employeeId, Employee updatedEmployee) {
        Employee existingEmployee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with employeeId: " + employeeId));

        // Allow update only for phoneNumber and address.
        // If any other updatable field is provided (non-null), throw an error.
        if (updatedEmployee.getFullName() != null ||
            updatedEmployee.getEmail() != null ||
            updatedEmployee.getGender() != null ||
            updatedEmployee.getDateOfBirth() != null ||
            updatedEmployee.getRole() != null ||
            updatedEmployee.getDateOfJoining() != null ||
            updatedEmployee.getEmployeeType() != null ||
            updatedEmployee.getStatus() != null ||
            updatedEmployee.getDepartment() != null ||
            updatedEmployee.getDesignation() != null ||
            updatedEmployee.getBasicSalary() != null) {

            throw new IllegalArgumentException("Only phone number and address can be updated");
        }

        // Proceed with updating phone number and/or address if provided.
        if (updatedEmployee.getPhoneNumber() != null) {
            existingEmployee.setPhoneNumber(updatedEmployee.getPhoneNumber());
        }
        if (updatedEmployee.getAddress() != null) {
            existingEmployee.setAddress(updatedEmployee.getAddress());
        }
        
        return employeeRepository.save(existingEmployee);
    }

    // First step: Request OTP
    public void requestPasswordChangeOtp(Long employeeId) {
        try {
            Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
            
            notificationServiceClient.sendOtp(employee.getEmployeeId());
            log.info("OTP request sent for employee ID: {}", employeeId);
        } catch (Exception e) {
            log.error("Failed to request OTP: {}", e.getMessage());
            throw new RuntimeException("Failed to send OTP");
        }
    }

    // Second step: Verify OTP and change password
    @Transactional
    public boolean changePassword(Long employeeId, PasswordChangeDTO passwordChangeDTO) {
        try {
            Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

            // First verify OTP
            OtpVerificationDTO otpVerificationDTO = new OtpVerificationDTO(
                employeeId.toString(),
                passwordChangeDTO.getOtp()
            );

            if (!notificationServiceClient.verifyOtp(otpVerificationDTO)) {
                throw new IllegalArgumentException("Invalid or expired OTP");
            }

            // Then validate password
            validatePasswordChange(employee, passwordChangeDTO);

            // Update password
            String encodedPassword = passwordEncoder.encode(passwordChangeDTO.getNewPassword());
            employee.setPassword(encodedPassword);
            employeeRepository.save(employee);
            
            log.info("Password changed successfully for employee ID: {}", employeeId);
            return true;
        } catch (Exception e) {
            log.error("Password change failed: {}", e.getMessage());
            throw e;
        }
    }

    private void validatePasswordChange(Employee employee, PasswordChangeDTO dto) {
        if (!passwordEncoder.matches(dto.getCurrentPassword(), employee.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        if (!dto.isPasswordMatching()) {
            throw new IllegalArgumentException("New passwords don't match");
        }

        if (passwordEncoder.matches(dto.getNewPassword(), employee.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }
    }

}