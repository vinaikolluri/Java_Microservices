package com.example.auth.dto;

import com.example.auth.model.Employee;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long employeeId;
    private String role;
    private String email;
    
    private Long expiresIn;

    public JwtAuthResponse(String accessToken, Employee employee) {
        this.accessToken = accessToken;
        this.employeeId = employee.getEmployeeId();
        this.role = employee.getRole().name();
        this.expiresIn = 31536000L; 
        this.email = employee.getEmail();
    }
} 