package com.notification.dto;

import lombok.Data;

@Data
public class ForgotPasswordDTO {
    private String email;
    private String otp;
    private String newPassword;
    private String confirmPassword;


    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}