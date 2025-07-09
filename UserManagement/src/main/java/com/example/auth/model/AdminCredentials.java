package com.example.auth.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AdminCredentials {
    @JsonProperty("admin_email")
    private String email;
    
    @JsonProperty("admin_password")
    private String password;
    
    @JsonProperty("admin_full_name")
    private String fullName;
    
    @JsonProperty("admin_phone_number")
    private String phoneNumber;
    
    @JsonProperty("admin_employee_id")
    private Long employeeId;
    
    @JsonProperty("admin_target_email")
    private String targetEmail;
}

