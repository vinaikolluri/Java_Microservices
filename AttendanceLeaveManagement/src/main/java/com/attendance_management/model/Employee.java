package com.attendance_management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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

	@NotBlank(message = "Fullname is required")
	private String fullName;


	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	@Column(unique = true, nullable = false)
	private String email;

	@NotNull(message = "Employee ID is required")
	@Column(name = "employee_id", unique = true, nullable = false)
	private Long employeeId;

	@JsonIgnore
	@NotBlank(message = "Password is required")
	private String password;

	@NotBlank(message = "Phone number is required")
	@Pattern(regexp = "^\\+(?:[0-9] ?){6,14}[0-9]$", message = "Phone number must start with '+' followed by country code and number with proper spacing (e.g., +91 9876543210)")
	@Column(name = "phone_number", unique = true, nullable = false)
	private String phoneNumber;

	@Enumerated(EnumType.STRING)
	private Gender gender;

	@Column(name = "date_of_birth")
	private LocalDate dateOfBirth;

	private String address;

	@NotNull(message = "Role is required")
	@Enumerated(EnumType.STRING)
	private EmployeeRole role;

	@Column(name = "date_of_joining")
	private LocalDate dateOfJoining;

	@NotNull(message = "Employee type is required")
	@Enumerated(EnumType.STRING)
	private EmployeeType employeeType;

	@Enumerated(EnumType.STRING)
	private EmployeeStatus status;

	@NotBlank(message = "Department is required")
	@Column(nullable = false)
	private String department;

	@NotBlank(message = "Designation is required")
	@Column(name = "designation", nullable = false)
	private String designation;

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
