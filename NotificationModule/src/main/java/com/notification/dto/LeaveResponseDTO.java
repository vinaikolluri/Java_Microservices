package com.notification.dto;


import lombok.Data;
import java.time.LocalDate;

import com.notification.entity.LeaveStatus;
import com.notification.entity.LeaveType;

@Data
public class LeaveResponseDTO {
    private Long id;
    private Long employeeId;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private LeaveStatus status;
    private String hrRemarks;
}