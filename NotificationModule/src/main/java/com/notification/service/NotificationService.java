package com.notification.service;

import com.notification.dto.ForgotPasswordDTO;
import com.notification.dto.LeaveResponseDTO;
import com.notification.dto.UserCredentialsDTO;
import com.notification.repository.OTPRepository;
import com.notification.repository.EmployeeRepository;
import com.notification.entity.Employee;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final String WEBSITE_URL = "www.google.com";

    private final JavaMailSender mailSender;
    private final EmployeeRepository employeeRepository;
    private final OTPRepository otpRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // Constructor-based injection for better testing
    public NotificationService(OTPRepository otpRepository, JavaMailSender mailSender, 
            EmployeeRepository employeeRepository) {
        this.mailSender = mailSender;
        this.employeeRepository = employeeRepository;
        this.otpRepository = otpRepository;
    }

    public void sendCredentials(String targetEmail, UserCredentialsDTO credentials) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(targetEmail);
            message.setSubject("Employee Account Credentials");
            message.setText(String.format("""
                Dear %s,
                
                Here are the credentials:
                
                Employee ID: %d
                Email: %s
                Password: %s
                Website Link: %s
                
                Please ensure to share these credentials securely.
                The employee should change their password upon first login.
                
                Best regards,
                HR Manager
                Attivo
                """,
                credentials.getFullName(),
                credentials.getEmployeeId(),
                credentials.getEmail(),
                credentials.getPassword(),
                WEBSITE_URL
            ));
            
            mailSender.send(message);
            log.info("Credentials email sent successfully to: {}", targetEmail);
        } catch (Exception e) {
            log.error("Failed to send credentials email: ", e);
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }


    public void sendLeaveApprovalNotification(LeaveResponseDTO leaveResponse) {
        Employee employee = employeeRepository.findByEmployeeId(leaveResponse.getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + leaveResponse.getEmployeeId()));
            
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(employee.getEmail());
            message.setSubject("Leave Request Approved");
            message.setText(String.format("""
                Dear %s,
                
                Your leave request has been approved!
                
                Leave Details:
                Start Date: %s
                End Date: %s
                HR Remarks: %s
                
                Please ensure to:
                1. Complete any pending work before your leave
                2. Set up an out-of-office email response
                3. Brief your team members about ongoing tasks
                
                Best regards,
                HR Team
                """,
                employee.getFullName(),
                leaveResponse.getStartDate(),
                leaveResponse.getEndDate(),
                leaveResponse.getHrRemarks()
            ));
            message.setFrom(fromEmail);
            
            mailSender.send(message);
            log.info("Leave approval notification sent successfully to: {}", employee.getEmail());
        } catch (Exception e) {
            log.error("Failed to send leave approval notification: ", e);
            throw new RuntimeException("Failed to send leave approval email: " + e.getMessage());
        }
    }

    public void sendLeaveRejectionNotification(LeaveResponseDTO leaveResponse) {
        Employee employee = employeeRepository.findByEmployeeId(leaveResponse.getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + leaveResponse.getEmployeeId()));
            
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(employee.getEmail());
            message.setSubject("Leave Request Not Approved");
            message.setText(String.format("""
                Dear %s,
                
                We regret to inform you that your leave request has not been approved.
                
                Leave Details:
                Leave Type: %s
                Start Date: %s
                End Date: %s
                HR Remarks: %s
                
                If you need to discuss this further, please reach out to your reporting manager or HR.
                
                Best regards,
                HR Team
                """,
                employee.getFullName(),
                leaveResponse.getLeaveType(),
                leaveResponse.getStartDate(),
                leaveResponse.getEndDate(),
                leaveResponse.getHrRemarks()
            ));
            message.setFrom(fromEmail);
            
            mailSender.send(message);
            log.info("Leave rejection notification sent successfully to: {}", employee.getEmail());
        } catch (Exception e) {
            log.error("Failed to send leave rejection notification: ", e);
            throw new RuntimeException("Failed to send leave rejection email: " + e.getMessage());
        }
    }

    public void sendOtp(Long employeeId) {
        // Logging the incoming employeeId can help debug the issue.
        log.debug("Lookup employee with employee ID: {}", employeeId);
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));
            
        String otp = generateOtp();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(employee.getEmail());
            message.setSubject("Password Change OTP");
            message.setText(String.format("""
                Dear %s,
                
                Your OTP for password change is: %s
                
                This OTP will expire in 5 minutes.
                If you did not request this, please contact HR immediately.
                
                Best regards,
                HR Team
                """,
                employee.getFullName(),
                otp
            ));
            message.setFrom(fromEmail);
            
            mailSender.send(message);
            otpRepository.save(employee.getEmail(), otp, expiryTime);
            log.info("OTP sent successfully to: {}", employee.getEmail());
        } catch (Exception e) {
            log.error("Failed to send OTP: ", e);
            throw new RuntimeException("Failed to send OTP: " + e.getMessage());
        }
    }

    public boolean verifyOtp(String employeeId, String otp) {
        Employee employee = employeeRepository.findByEmployeeId(Long.parseLong(employeeId))
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));
            
        String storedOtp = otpRepository.getOtp(employee.getEmail());
        return storedOtp != null && storedOtp.equals(otp);
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public void initiatePasswordReset(String email) {
        Employee employee = employeeRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("No account found with email: " + email));
            
        String otp = generateOtp();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Password Reset OTP");
            message.setText(String.format("""
                Dear %s,
                
                You have requested to reset your password.
                Your OTP for password reset is: %s
                
                This OTP will expire in 5 minutes.
                If you did not request this, please ignore this email or contact HR immediately.
                
                Best regards,
                HR Team
                """,
                employee.getFullName(),
                otp
            ));
            message.setFrom(fromEmail);
            
            mailSender.send(message);
            otpRepository.save(email, otp, expiryTime);
            log.info("Password reset OTP sent successfully to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset OTP: ", e);
            throw new RuntimeException("Failed to send password reset OTP: " + e.getMessage());
        }
    }

    public void resetPassword(ForgotPasswordDTO resetRequest) {
        // Validate password match
        if (!resetRequest.getNewPassword().equals(resetRequest.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        // Verify OTP
        String storedOtp = otpRepository.getOtp(resetRequest.getEmail());
        if (storedOtp == null || !storedOtp.equals(resetRequest.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Get employee and update password
        Employee employee = employeeRepository.findByEmail(resetRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("No account found with email: " + resetRequest.getEmail()));

        // Update password logic here - you'll need to implement this in your employee service
        // This is just a placeholder - implement the actual password update logic
        employee.setPassword(resetRequest.getNewPassword()); // Assume you have password encryption in place
        employeeRepository.save(employee);

        // Clear the OTP after successful password reset
        otpRepository.deleteByEmail(resetRequest.getEmail());
        
        log.info("Password reset successful for email: {}", resetRequest.getEmail());
    }
}
