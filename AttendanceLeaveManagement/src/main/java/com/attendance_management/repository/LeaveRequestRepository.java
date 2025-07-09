package com.attendance_management.repository;

import com.attendance_management.model.LeaveRequest;
import com.attendance_management.model.LeaveStatus;
import com.attendance_management.model.LeaveType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeId(Long employeeId);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    List<LeaveRequest> findByEmployeeIdAndStartDateGreaterThanEqual(Long employeeId, LocalDate date);

    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveStatus status);

    List<LeaveRequest> findByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(Long employeeId,
            LeaveStatus status, LocalDate endDate, LocalDate startDate);

    int countByEmployeeId(Long employeeId);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.employeeId = :employeeId AND l.startDate <= :date AND l.endDate >= :date")
    int countByEmployeeIdAndDateInLeaveRange(@Param("employeeId") Long employeeId, @Param("date") LocalDate date);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employeeId = :employeeId " +
           "AND ((l.startDate BETWEEN :startDate AND :endDate) " +
           "OR (l.endDate BETWEEN :startDate AND :endDate) " +
           "OR (:startDate BETWEEN l.startDate AND l.endDate))")
    List<LeaveRequest> findByEmployeeIdAndDateRange(
        @Param("employeeId") Long employeeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT l FROM LeaveRequest l WHERE l.employeeId = :employeeId " +
           "AND ((l.startDate BETWEEN :startDate AND :endDate) " +
           "OR (l.endDate BETWEEN :startDate AND :endDate) " +
           "OR (:startDate BETWEEN l.startDate AND l.endDate)) " +
           "AND l.leaveType = :leaveType")
    List<LeaveRequest> findByEmployeeIdAndDateRangeAndType(
        @Param("employeeId") Long employeeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("leaveType") LeaveType leaveType
    );

    @Query("SELECT l FROM LeaveRequest l WHERE l.employeeId = :employeeId " +
           "AND ((l.startDate BETWEEN :startDate AND :endDate) " +
           "OR (l.endDate BETWEEN :startDate AND :endDate) " +
           "OR (:startDate BETWEEN l.startDate AND l.endDate)) " +
           "AND l.leaveType != :leaveType")
    List<LeaveRequest> findByEmployeeIdAndDateRangeAndTypeNot(
        @Param("employeeId") Long employeeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("leaveType") LeaveType leaveType
    );

    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM LeaveRequest l " +
            "WHERE l.employeeId = :employeeId " +
            "AND :date BETWEEN l.startDate AND l.endDate " +
            "AND l.status = 'APPROVED'")
    boolean existsByEmployeeIdAndDate(
            @Param("employeeId") Long employeeId,
            @Param("date") LocalDate date);

    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM LeaveRequest l " +
           "WHERE l.employeeId = :employeeId " +
           "AND :checkDate BETWEEN l.startDate AND l.endDate " +
           "AND l.status = :status")
    boolean existsByEmployeeIdAndDateRangeAndStatus(
        @Param("employeeId") Long employeeId,
        @Param("checkDate") LocalDate checkDate,
        @Param("status") LeaveStatus status
    );

    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM LeaveRequest l " +
           "WHERE l.employeeId = :employeeId " +
           "AND :checkDate BETWEEN l.startDate AND l.endDate " +
           "AND l.status = :status")
    boolean existsByDateInRange(
        @Param("employeeId") Long employeeId,
        @Param("checkDate") LocalDate checkDate,
        @Param("status") LeaveStatus status
    );

    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM LeaveRequest l " +
           "WHERE l.employeeId = :employeeId " +
           "AND l.startDate <= :endDate AND l.endDate >= :startDate " +
           "AND :checkDate BETWEEN l.startDate AND l.endDate " +
           "AND l.status = :status")
    boolean existsByDateRangeAndStatus(
        @Param("employeeId") Long employeeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("checkDate") LocalDate checkDate,
        @Param("status") LeaveStatus status
    );

    List<LeaveRequest> findByStatusAndEndDateLessThanEqual(LeaveStatus status, LocalDate date);
    
    List<LeaveRequest> findByStatusAndStartDate(LeaveStatus status, LocalDate startDate);
    List<LeaveRequest> findByStatusAndEndDate(LeaveStatus status, LocalDate endDate);
}