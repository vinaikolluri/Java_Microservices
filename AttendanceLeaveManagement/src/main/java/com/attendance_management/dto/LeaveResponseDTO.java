package com.attendance_management.dto;

import com.attendance_management.model.LeaveStatus;
import com.attendance_management.model.LeaveType;
import lombok.Data;
import java.time.LocalDate;

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