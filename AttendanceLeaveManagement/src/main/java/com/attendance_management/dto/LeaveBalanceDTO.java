package com.attendance_management.dto;

import com.attendance_management.model.LeaveType;
import lombok.Data;

@Data
public class LeaveBalanceDTO {
    private Long employeeId;
    private LeaveType leaveType;
    private Integer totalLeaves;
    private Integer usedLeaves;
    private Integer remainingLeaves;
    private Integer year;
}