package com.EmpolyeeManagement.app.controller;

import com.EmpolyeeManagement.app.dto.PasswordChangeDTO;
import com.EmpolyeeManagement.app.model.Employee;
import com.EmpolyeeManagement.app.services.EmployeeService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    
    private final EmployeeService employeeService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Employee> getByEmployeeId(@PathVariable Long employeeId) {
        Employee employee = employeeService.getByEmployeeId(employeeId);
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/employee/{employeeId}")
    public ResponseEntity<Employee> updateByEmployeeId(
            @PathVariable Long employeeId,
            @RequestBody Employee employee) {
        Employee updatedEmployee = employeeService.updateByEmployeeId(employeeId, employee);
        return ResponseEntity.ok(updatedEmployee);
    }

    @PostMapping("/{employeeId}/request-otp")
    public ResponseEntity<String> requestPasswordChangeOtp(@PathVariable Long employeeId) {
        try {
            employeeService.requestPasswordChangeOtp(employeeId);
            return ResponseEntity.ok("OTP sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{employeeId}/change-password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long employeeId,
            @Valid @RequestBody PasswordChangeDTO passwordChangeDTO) {
        try {
            boolean changed = employeeService.changePassword(employeeId, passwordChangeDTO);
            return changed ? 
                ResponseEntity.ok("Password changed successfully") : 
                ResponseEntity.badRequest().body("Failed to change password");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
