package com.attendance_management.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.attendance_management.dto.LeaveResponseDTO;

import com.attendance_management.config.FeignClientConfig;

import jakarta.validation.Valid;

@FeignClient(name = "notification-service", url = "${notification.service.url}", configuration = FeignClientConfig.class)
public interface NotificationServiceClient {

    @PostMapping("/api/notifications/leave/approval")
    void sendLeaveApprovalNotification(@Valid @RequestBody LeaveResponseDTO leaveResponse);

    @PostMapping("/api/notifications/leave/rejection")
    void sendLeaveRejectionNotification(@Valid @RequestBody LeaveResponseDTO leaveResponse);
}