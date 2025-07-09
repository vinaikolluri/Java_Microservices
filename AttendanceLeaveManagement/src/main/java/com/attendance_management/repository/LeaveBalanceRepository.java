package com.attendance_management.repository;


import com.attendance_management.model.LeaveBalance;
import com.attendance_management.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeAndYear(Long employeeId, LeaveType leaveType, Integer year);
    List<LeaveBalance> findByYear(Integer year);
    List<LeaveBalance> findByEmployeeIdAndYear(Long employeeId, Integer year);
} 