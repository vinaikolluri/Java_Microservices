package com.attendance_management.controller;

import com.attendance_management.model.LeaveRequest;
import com.attendance_management.model.LeaveStatus;
import com.attendance_management.dto.LeaveBalanceDTO;
import com.attendance_management.dto.LeaveRequestDTO;
import com.attendance_management.dto.LeaveResponseDTO;
import com.attendance_management.model.Attendance;
import com.attendance_management.service.LeaveService;
import com.attendance_management.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeController {
    private final LeaveService leaveService;
    private final AttendanceService attendanceService;

    // Leave Management Endpoints
    @PostMapping("/leave/apply")
    public ResponseEntity<LeaveResponseDTO> applyLeave(@Valid @RequestBody LeaveRequestDTO leaveRequestDTO) {
        return ResponseEntity.ok(leaveService.applyLeave(leaveRequestDTO));
    }

    @GetMapping("/leaves/{employeeId}")
    public ResponseEntity<List<LeaveRequest>> getMyLeaves(
            @PathVariable Long employeeId,
            @RequestParam(required = false) LeaveStatus status) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaves(employeeId, status));
    }

    @GetMapping("/leave-balances/{employeeId}")
    public ResponseEntity<List<LeaveBalanceDTO>> getMyLeaveBalances(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaveBalances(employeeId, year)
                .stream()
                .map(leaveService::convertToBalanceDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/balance/{employeeId}")
    public ResponseEntity<List<LeaveBalanceDTO>> getCurrentLeaveBalance(@PathVariable Long employeeId) {
        List<LeaveBalanceDTO> balances = leaveService.getCurrentLeaveBalance(employeeId);
        return ResponseEntity.ok(balances);
    }

    // Attendance Management Endpoints
    @PostMapping("/attendance/check-in")
    public ResponseEntity<?> checkIn(@RequestParam Long employeeId) {
        try {
            return ResponseEntity.ok(attendanceService.checkIn(employeeId));
        } catch (IllegalStateException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                    "error", true,
                    "message", "Already checked in/out for today. Cannot check in again.",
                    "timestamp", LocalDateTime.now()
                ));
        }
    }

    @PostMapping("/attendance/check-out")
    public ResponseEntity<?> checkOut(
            @RequestParam Long employeeId) {
        try {
            return ResponseEntity.ok(attendanceService.checkOut(employeeId));
        } catch (IllegalStateException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                    "error", true,
                    "message", e.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
        }
    }

    @GetMapping("/attendance/{employeeId}")
    public ResponseEntity<List<Attendance>> getEmployeeAttendance(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendance(employeeId));
    }

}