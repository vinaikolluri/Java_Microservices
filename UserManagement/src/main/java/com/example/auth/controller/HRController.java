package com.example.auth.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth.dto.EmployeeRegistrationDto;
import com.example.auth.dto.EmployeeUpdateDto;
import com.example.auth.exception.ApiException;
import com.example.auth.model.Employee;
import com.example.auth.model.EmployeeRole;
import com.example.auth.service.EmployeeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/hr")
@PreAuthorize("HR")
public class HRController {
	
	private static final Logger log = LoggerFactory.getLogger(HRController.class);
	
	private final EmployeeService employeeService;
	public HRController(EmployeeService employeeService) {
		this.employeeService = employeeService;
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
}
