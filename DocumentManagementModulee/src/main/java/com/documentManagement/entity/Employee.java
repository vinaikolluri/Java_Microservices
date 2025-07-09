package com.documentManagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "employees", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "employee_id")
    })
@Data
@NoArgsConstructor
public class Employee {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Full name is required")
	@Size(min = 8, max = 100, message = "Full name must be between 8 and 100 characters")
	@Pattern(regexp = "^[a-zA-Z\\s]*$", message = "Full name can only contain letters and spaces")
	private String fullName;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	@Size(max = 100, message = "Email cannot exceed 100 characters")
	@Column(unique = true, nullable = false)
	private String email;

	@NotNull(message = "Employee ID is required")
	@Column(name = "employee_id", unique = true, nullable = false)
	@Positive(message = "Employee ID must be a positive number")
	private Long employeeId;

	@JsonIgnore
	@NotBlank(message = "Password is required")
	@Size(min = 8, message = "Password must be at least 8 characters long")
	@Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$", 
			message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character")
	private String password;

	@NotBlank(message = "Phone number is required")
	@Pattern(regexp = "/^\\+\\d{1,3}[6-9]\\d{4}\\d{5}$/", 
			message = "Phone number must be in E.164 format (e.g., +1234567890)")
	@Column(name = "phone_number", unique = true, nullable = false)
	private String phoneNumber;

	@NotNull(message = "Gender is required")
	@Enumerated(EnumType.STRING)
	private Gender gender;

	@Past(message = "Date of birth must be in the past")
	@NotNull(message = "Date of birth is required")
	@Column(name = "date_of_birth")
	private LocalDate dateOfBirth;

	@Size(max = 255, message = "Address cannot exceed 255 characters")
	private String address;

	@NotNull(message = "Role is required")
	@Enumerated(EnumType.STRING)
	@Column(length = 50)
	private EmployeeRole role;

	@PastOrPresent(message = "Date of joining cannot be in the future")
	@NotNull(message = "Date of joining is required")
	@Column(name = "date_of_joining")
	private LocalDate dateOfJoining;

	@NotNull(message = "Employee type is required")
	@Enumerated(EnumType.STRING)
	private EmployeeType employeeType;

	@NotNull(message = "Status is required")
	@Enumerated(EnumType.STRING)
	private EmployeeStatus status;

	@NotBlank(message = "Department is required")
	@Size(min = 2, max = 50, message = "Department must be between 2 and 50 characters")
	@Column(nullable = false)
	private String department;

	@NotBlank(message = "Designation is required")
	@Size(min = 2, max = 50, message = "Designation must be between 2 and 50 characters")
	@Column(name = "designation", nullable = false)
	private String designation;

	@PositiveOrZero(message = "Basic salary cannot be negative")
	@Column(precision = 10, scale = 2)
	private BigDecimal basicSalary;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "hr_id")
	@JsonIgnore
	private HR hr;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "team_id")
	@JsonIgnore
	private Team team;
}
