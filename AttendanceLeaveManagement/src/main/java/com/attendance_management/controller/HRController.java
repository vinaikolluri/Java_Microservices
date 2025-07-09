package com.attendance_management.controller;

import com.attendance_management.model.*;
import com.attendance_management.service.LeaveService;
import com.attendance_management.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
public class HRController {
    private final LeaveService leaveService;
    private final AttendanceService attendanceService;

    // Leave Management Endpoints
    @PutMapping("/leave/{requestId}")
    public ResponseEntity<LeaveRequest> processLeaveRequest(
            @PathVariable Long requestId,
            @RequestParam LeaveStatus status,
            @RequestParam String remarks) {
        return ResponseEntity.ok(leaveService.processLeaveRequest(requestId, status, remarks));
    }

    @GetMapping("/leaves")
    public ResponseEntity<List<LeaveRequest>> getAllLeaves(
            @RequestParam(required = false) LeaveStatus status) {
        return ResponseEntity.ok(leaveService.getAllLeaves(status));
    }

    // Leave Balance Endpoints
    @GetMapping("/leave-balances")
    public ResponseEntity<List<LeaveBalance>> getAllLeaveBalances(
            @RequestParam(required = false) Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(leaveService.getAllLeaveBalances(targetYear));
    }

    // Attendance Management Endpoints
    @GetMapping("/attendance")
    public ResponseEntity<List<Attendance>> getAllAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAllAttendanceForDate(date));
    }

    @GetMapping("/attendance/employee/{employeeId}")
    public ResponseEntity<List<Attendance>> getEmployeeAttendance(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendance(employeeId));
    }

    // Check-in endpoint
    @PostMapping("/attendance/check-in/{employeeId}")
    public ResponseEntity<Attendance> checkIn(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceService.checkIn(employeeId));
    }

    // Check-out endpoint
    @PostMapping("/attendance/check-out/{employeeId}")
    public ResponseEntity<Attendance> checkOut(
            @PathVariable Long employeeId,
            @RequestParam String workDescription) {
        return ResponseEntity.ok(attendanceService.checkOut(employeeId));
    }

     // Get attendance summary for date range
     @GetMapping("/attendance/summary/{employeeId}")
     public ResponseEntity<List<Attendance>> getAttendanceSummary(
             @PathVariable Long employeeId,
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
         return ResponseEntity.ok(attendanceService.getAttendanceSummary(employeeId, startDate, endDate));
     }

    // Get all attendance for a specific date
    @GetMapping("/attendance/date")
    public ResponseEntity<List<Attendance>> getAllAttendanceForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAllAttendanceForDate(date));
    }

    // Get employee attendance for a specific date
    @GetMapping("/attendance/{employeeId}/date")
    public ResponseEntity<List<Attendance>> getEmployeeAttendance(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendance(employeeId, date));
    }

    @GetMapping("/attendance/range")
    public ResponseEntity<List<Attendance>> getAllAttendanceForDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
    return ResponseEntity.ok(attendanceService.getAllAttendanceForDateRange(startDate, endDate));
}
}