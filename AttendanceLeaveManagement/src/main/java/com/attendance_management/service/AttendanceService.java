package com.attendance_management.service;

import com.attendance_management.model.Attendance;
import com.attendance_management.model.AttendanceStatus;
import com.attendance_management.repository.AttendanceRepository;
import com.attendance_management.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    private static final double REQUIRED_HOURS = 9.0;
    private static final double HALF_DAY_HOURS = 4.0;

    @Transactional
    public Attendance checkIn(Long employeeId) {
        // Find employee using employeeId
        employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        // Check for any incomplete attendance from previous days
        List<Attendance> incompleteAttendance = attendanceRepository.findByEmployeeIdAndCheckOutIsNull(employeeId);
        if (!incompleteAttendance.isEmpty()) {
            throw new IllegalStateException(
                "You have incomplete attendance from " + 
                incompleteAttendance.get(0).getDate().toLocalDate() + 
                ". Please check out first."
            );
        }

        // Check if already checked in for today
        List<Attendance> todayAttendance = attendanceRepository.findByEmployeeIdAndDateBetween(
                employeeId, today.atStartOfDay(), today.atTime(23, 59, 59));

        if (!todayAttendance.isEmpty()) {
            throw new IllegalStateException("Already checked in for today");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployeeId(employeeId);
        attendance.setDate(now);
        attendance.setCheckIn(now);
        attendance.setStatus(AttendanceStatus.PRESENT); // Set initial status
        attendance.setWorkingHours(0.0); // Initialize working hours

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public Attendance checkOut(Long employeeId, LocalDate checkOutDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = checkOutDate.atStartOfDay();
        LocalDateTime endOfDay = checkOutDate.atTime(23, 59, 59);

        // Find attendance for the specified date
        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndDateBetween(employeeId, startOfDay, endOfDay)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No check-in found for " + checkOutDate));

        if (attendance.getCheckOut() != null) {
            throw new IllegalStateException("Already checked out for " + checkOutDate);
        }

        // If checking out for a previous day, set checkout time to end of that day
        LocalDateTime checkOutTime;
        if (checkOutDate.isBefore(LocalDate.now())) {
            checkOutTime = checkOutDate.atTime(23, 59, 59);
        } else {
            checkOutTime = now;
        }

        attendance.setCheckOut(checkOutTime);

        // Calculate working hours
        double hours = ChronoUnit.MINUTES.between(attendance.getCheckIn(), checkOutTime) / 60.0;
        attendance.setWorkingHours(hours);

        // Update status based on working hours
        updateAttendanceStatus(attendance, hours);

        return attendanceRepository.save(attendance);
    }

    // Convenience method for checking out for current day
    @Transactional
    public Attendance checkOut(Long employeeId) {
        return checkOut(employeeId, LocalDate.now());
    }

    private void updateAttendanceStatus(Attendance attendance, double hours) {
        if (hours >= REQUIRED_HOURS) {
            attendance.setStatus(AttendanceStatus.PRESENT);
        } else if (hours >= HALF_DAY_HOURS) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        } else {
            attendance.setStatus(AttendanceStatus.ABSENT);
        }
    }

    public List<Attendance> getAttendanceSummary(Long employeeId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndDateBetween(
                employeeId, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        return attendances;
    }

    public List<Attendance> getAllAttendanceForDate(LocalDate date) {
        return attendanceRepository.findByDateBetween(
            date.atStartOfDay(),
            date.atTime(23, 59, 59));
    }

    public List<Attendance> getEmployeeAttendance(Long employeeId, LocalDate date) {
        return attendanceRepository.findByEmployeeIdAndDateBetween(
                employeeId,
                date.atStartOfDay(),
                date.atTime(23, 59, 59));
    }

    public List<Attendance> getEmployeeAttendance(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    public List<Attendance> getAllAttendanceForDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByDateBetween(
            startDate.atStartOfDay(),
            endDate.atTime(23, 59, 59));
    }
}