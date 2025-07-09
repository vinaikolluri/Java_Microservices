package com.example.auth.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.example.auth.model.EmployeeRole;
import com.example.auth.model.EmployeeStatus;
import com.example.auth.model.EmployeeType;
import com.example.auth.model.Gender;
import com.example.auth.model.Employee;

@Data
public class EmployeeRegistrationDto {
    @NotBlank(message = "First name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;


	@NotBlank(message = "Password is required")
	@Size(min = 8, message = "Password must be between 8 and 20 characters long")
	@Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?!.*\\s).*$", message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$", message = "Phone number must be in E.164 format (e.g., +1234567890)")
    @Column(unique = true, nullable = false)
    private String phoneNumber;

    @NotNull(message = "Gender is required")
    private Gender gender;

    private LocalDate dateOfBirth;

    private String address;

    @NotNull(message = "Role is required")
    private EmployeeRole role;

    private LocalDate dateOfJoining;

    @NotNull(message = "Employee type is required")
    private EmployeeType employeeType;

    @NotNull(message = "Status is required")
    private EmployeeStatus status;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Designation is required")
    private String designation;

    private BigDecimal basicSalary;
    
    @NotBlank(message = "Target email is required")
    @Email(message = "Invalid target email format")
    private String targetEmail;


    public Employee toEmployee() {
        Employee employee = new Employee();
        employee.setFullName(this.fullName);
        employee.setEmail(this.email);
        employee.setPassword(this.password);
        employee.setPhoneNumber(this.phoneNumber);
        employee.setEmployeeId(this.employeeId);
        employee.setGender(this.gender);
        employee.setDateOfBirth(this.dateOfBirth);
        employee.setAddress(this.address);
        employee.setRole(this.role);
        employee.setDateOfJoining(this.dateOfJoining);
        employee.setEmployeeType(this.employeeType);
        employee.setStatus(this.status);
        employee.setDepartment(this.department);
        employee.setDesignation(this.designation);
        employee.setBasicSalary(this.basicSalary);
        employee.setTargetEmail(this.targetEmail);
        return employee;
    }
} 