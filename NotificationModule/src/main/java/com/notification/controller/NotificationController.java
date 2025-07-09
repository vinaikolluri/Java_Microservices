package com.notification.controller;

import com.notification.dto.LeaveResponseDTO;
import com.notification.dto.UserCredentialsDTO;
import com.notification.dto.OtpVerificationDTO;
import com.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;

    @PostMapping("/send-credentials")
    public ResponseEntity<String> sendCredentials(
            @RequestParam("email") String targetEmail,
            @RequestBody UserCredentialsDTO credentials) {
        try {
            notificationService.sendCredentials(targetEmail, credentials);
            return ResponseEntity.ok("Credentials sent successfully");
        } catch (Exception e) {
            log.error("Failed to send credentials: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send credentials: " + e.getMessage());
        }
    }

    @PostMapping("/leave/approval")
    public ResponseEntity<String> sendLeaveApprovalNotification(
            @Valid @RequestBody LeaveResponseDTO leaveResponse) {
        try {
            notificationService.sendLeaveApprovalNotification(leaveResponse);
            return ResponseEntity.ok("Leave approval notification sent successfully");
        } catch (Exception e) {
            log.error("Failed to send leave approval notification: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send leave approval notification: " + e.getMessage());
        }
    }

    @PostMapping("/leave/rejection")
    public ResponseEntity<String> sendLeaveRejectionNotification(
            @Valid @RequestBody LeaveResponseDTO leaveResponse) {
        try {
            notificationService.sendLeaveRejectionNotification(leaveResponse);
            return ResponseEntity.ok("Leave rejection notification sent successfully");
        } catch (Exception e) {
            log.error("Failed to send leave rejection notification: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send leave rejection notification: " + e.getMessage());
        }
    }

    @PostMapping("/request-otp/{employeeId}")
    public ResponseEntity<String> sendOtp(@PathVariable Long employeeId) {
        try {
            notificationService.sendOtp(employeeId);
            return ResponseEntity.ok("OTP sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Boolean> verifyOtp(@RequestBody OtpVerificationDTO otpVerificationDTO) {
        try {
            boolean isValid = notificationService.verifyOtp(
                otpVerificationDTO.getEmployeeId(), 
                otpVerificationDTO.getOtp()
            );
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(false);
        }
    }
}
