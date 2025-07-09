package com.notification.controller;

import com.notification.dto.ForgotPasswordDTO;
import com.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password")
public class PasswordResetController {

    private final NotificationService notificationService;

    public PasswordResetController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/forgot")
    public ResponseEntity<String> initiatePasswordReset(@RequestParam String email) {
        notificationService.initiatePasswordReset(email);
        return ResponseEntity.ok("Password reset OTP has been sent to your email");
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@RequestBody ForgotPasswordDTO resetRequest) {
        notificationService.resetPassword(resetRequest);
        return ResponseEntity.ok("Password has been reset successfully");
    }
}