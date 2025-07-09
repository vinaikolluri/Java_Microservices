package com.example.auth.controller;

import com.example.auth.dto.TemporaryAccessRequestDto;
import com.example.auth.dto.EmployeeRegistrationDto;
import com.example.auth.dto.EmployeeUpdateDto;
import com.example.auth.model.*;
import com.example.auth.service.EmployeeService;
import com.example.auth.service.TemporaryAccessService;
import com.example.auth.exception.ApiException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("ADMIN")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final EmployeeService employeeService;
    private final TemporaryAccessService temporaryAccessService;

    public AdminController(EmployeeService employeeService, 
                       TemporaryAccessService temporaryAccessService) {
        this.employeeService = employeeService;
        this.temporaryAccessService = temporaryAccessService;
    }

    @PostMapping("/register/hr")
    public ResponseEntity<?> registerHR(@Valid @RequestBody EmployeeRegistrationDto registrationDto) {
        try {
            registrationDto.setRole(EmployeeRole.HR);
            
            Employee employee = registrationDto.toEmployee();
            Employee registeredHR = employeeService.registerEmployee(employee);
            
            if (registeredHR == null) {
                log.error("RegisteredHR is null after registration");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to register HR employee"));
            }
            
            return ResponseEntity.ok(registeredHR);
            
        } catch (ApiException e) {
            log.error("API Exception during HR registration: ", e);
            return ResponseEntity.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during HR registration: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register/employee")
    public ResponseEntity<?> registerEmployee(@Valid @RequestBody EmployeeRegistrationDto registrationDto) {
        try {
            registrationDto.setRole(EmployeeRole.EMPLOYEE);
            
            Employee employee = registrationDto.toEmployee();
            Employee registeredEmployee = employeeService.registerEmployee(employee);
            
            return ResponseEntity.ok(registeredEmployee);
 
        } catch (ApiException e) {
            return ResponseEntity.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/{employeeId}/send-credentials")
    public ResponseEntity<?> sendEmployeeCredentials(@PathVariable Long employeeId) {
        try {
            employeeService.sendEmployeeCredentials(employeeId);
            return ResponseEntity.ok()
                .body(Map.of("message", "Credentials sent successfully"));
        } catch (ApiException e) {
            log.error("API Exception while sending credentials: ", e);
            return ResponseEntity.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error while sending credentials: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/update/employee/{employeeId}")
    public ResponseEntity<Employee> updateByEmployeeId(
            @PathVariable Long employeeId,
            @RequestBody EmployeeUpdateDto employeeUpdateDto) {
        // Directly call the service layer with employeeId and the DTO
        Employee updatedEmployee = employeeService.updateEmployeeById(employeeId, employeeUpdateDto);
        
        // Return the updated employee
        return ResponseEntity.ok(updatedEmployee);
    }


    @GetMapping("/getAllEmployees")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PostMapping("/grant-temporary-access")
    public ResponseEntity<?> grantTemporaryAccess(
            @Valid @RequestBody TemporaryAccessRequestDto requestDto) {
        try {
            TemporaryAccess access = temporaryAccessService.grantTemporaryAccess(
                requestDto, 
                String.valueOf(requestDto.getEmployeeId())
            );
            return ResponseEntity.ok(access);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
