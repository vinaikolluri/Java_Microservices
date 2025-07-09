package com.example.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import com.example.auth.dto.ForgotPasswordDTO;
import com.example.auth.service.PasswordResetService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/password")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot")
    public ResponseEntity<String> initiatePasswordReset(@RequestParam String email) {
        passwordResetService.initiatePasswordReset(email);
        return ResponseEntity.ok("Password reset instructions sent to your email");
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ForgotPasswordDTO resetRequest) {
        passwordResetService.resetPassword(resetRequest);
        return ResponseEntity.ok("Password has been reset successfully");
    }
}