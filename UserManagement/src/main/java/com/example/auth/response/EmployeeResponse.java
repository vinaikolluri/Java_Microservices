package com.example.auth.response;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmployeeResponse {

		private Long id;
		
	    private String email;

	    @NotNull(message = "Employee ID is required")
	    private Long employeeId;

	    @NotBlank(message = "Password is required")
	    private String password;



	    
}
