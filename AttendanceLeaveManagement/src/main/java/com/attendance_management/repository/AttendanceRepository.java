package com.attendance_management.repository;

import com.attendance_management.model.Attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
        List<Attendance> findByEmployeeId(Long employeeId);

        Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDateTime date);

        List<Attendance> findByDateBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

        int countByEmployeeId(Long employeeId);

        @Query("SELECT COUNT(a) FROM Attendance a " +
                        "WHERE a.employeeId = :employeeId " +
                        "AND FUNCTION('YEAR', a.date) = :year " +
                        "AND FUNCTION('MONTH', a.date) = :month " +
                        "AND FUNCTION('DAY', a.date) = :day")
        int countByEmployeeIdAndDate(@Param("employeeId") Long employeeId,
                        @Param("year") int year,
                        @Param("month") int month,
                        @Param("day") int day);

        @Query(value = "SELECT COALESCE(SUM(hours_worked), 0.0) FROM attendance " +
                        "WHERE employee_id = :employeeId " +
                        "AND YEAR(date) = :year " +
                        "AND MONTH(date) = :month " +
                        "AND DAY(date) = :day", nativeQuery = true)
        double getHoursWorkedByEmployeeAndDate(
                        @Param("employeeId") Long employeeId,
                        @Param("year") int year,
                        @Param("month") int month,
                        @Param("day") int day);
        @Query("SELECT a FROM Attendance a WHERE a.employeeId = :employeeId AND CAST(a.date AS LocalDate) = :date")
        Optional<Attendance> findByEmployeeIdAndDate(@Param("employeeId") Long employeeId, @Param("date") LocalDate date);
        
        @Query("SELECT a FROM Attendance a WHERE a.employeeId = :employeeId AND a.date BETWEEN :startDateTime AND :endDateTime")
        List<Attendance> findByEmployeeIdAndDateBetween(
            @Param("employeeId") Long employeeId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
        );

        @Query("SELECT a FROM Attendance a WHERE a.employeeId = :employeeId " +
           "AND a.date >= :startDate AND a.date <= :endDate")
        List<Attendance> findByEmployeeIdAndDateBetween(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
        );
        List<Attendance> findByCheckOutIsNullAndDateBetween(LocalDateTime startDate, LocalDateTime endDate);
        
        List<Attendance> findByEmployeeIdAndCheckOutIsNull(Long employeeId);
}