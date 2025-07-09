package com.example.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.auth.config.FeignClientConfig;
import com.example.auth.dto.UserCredentialsDTO;
import com.example.auth.dto.ForgotPasswordDTO;

@FeignClient(
    name = "notification-service",
    url = "${notification.service.url}",
    configuration = FeignClientConfig.class
)
public interface NotificationServiceClient {
    @PostMapping("/api/notifications/send-credentials")
    void sendCredentials(@RequestParam("email") String email, @RequestBody UserCredentialsDTO credentials);

    @PostMapping("/api/password/forgot")
    void initiatePasswordReset(@RequestParam("email") String email);

    @PostMapping("/api/password/reset")
    void resetPassword(@RequestBody ForgotPasswordDTO resetRequest);
}