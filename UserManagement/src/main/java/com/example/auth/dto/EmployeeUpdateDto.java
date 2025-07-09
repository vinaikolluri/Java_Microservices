package com.example.auth.dto;

import java.math.BigDecimal;
import com.example.auth.model.EmployeeStatus;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EmployeeUpdateDto {

	@Enumerated(EnumType.STRING)
	private EmployeeStatus status;

	@Size(min = 2, max = 50, message = "Department must be between 2 and 50 characters")
	private String department;

	@Size(min = 2, max = 50, message = "Designation must be between 2 and 50 characters")
	private String designation;

	@PositiveOrZero(message = "Basic salary cannot be negative")
	@Column(precision = 10, scale = 2)
	private BigDecimal basicSalary;
	
}
