package com.notification.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.notification.entity.LeaveRequest;
import com.notification.entity.LeaveStatus;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    List<LeaveRequest> findByStatus(LeaveStatus status);
    List<LeaveRequest> findByEmployeeIdAndStartDateGreaterThanEqual(Long employeeId, LocalDate date);
    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveStatus status);
    List<LeaveRequest> findByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(Long employeeId, LeaveStatus status, LocalDate endDate, LocalDate startDate);
    int countByEmployeeId(Long employeeId);
    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.employeeId = :employeeId AND l.startDate <= :date AND l.endDate >= :date")
    int countByEmployeeIdAndDateInLeaveRange(@Param("employeeId") Long employeeId, @Param("date") LocalDate date);
} 