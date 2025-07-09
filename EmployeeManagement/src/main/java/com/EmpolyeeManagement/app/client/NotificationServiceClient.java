package com.EmpolyeeManagement.app.client;

import com.EmpolyeeManagement.app.dto.OtpVerificationDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", url = "${notification.service.url}")
public interface NotificationServiceClient {
    
    @PostMapping("/api/notifications/request-otp/{employeeId}")
    void sendOtp(@PathVariable("employeeId") Long employeeId);
    
    @PostMapping("/api/notifications/verify-otp")
    boolean verifyOtp(@RequestBody OtpVerificationDTO otpVerificationDTO);
}
