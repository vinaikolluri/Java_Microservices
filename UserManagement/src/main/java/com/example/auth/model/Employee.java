package com.example.auth.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Period;

@Entity
@Table(name = "employees", uniqueConstraints = {
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
    @Size(min = 5, max = 100, message = "Full name must be between 5 and 100 characters")
    @Pattern(regexp = "^[A-Z][a-z]+ [A-Z][a-z]+$", message = "Full name must contain first and last name, each starting with a capital letter, separated by one space")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@(gmail\\.com|outlook\\.com)$", message = "Email must end with @gmail.com, @outlook.com")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    @Column(unique = true, nullable = false)
    private String email;

    @NotNull(message = "Employee ID is required")
    @Column(name = "employee_id", unique = true, nullable = false)
    @Positive(message = "Employee ID must be a positive number")
    private Long employeeId;

    @JsonIgnore
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be between 8 and 20 characters long")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?!.*\\s).*$", message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+(?:91[ ]?)?[6-9]\\d{9}$", message = "Phone number must be a valid Indian number starting with +91 followed by 10 digits")
    @Column(name = "phone_number", unique = true, nullable = false)
    private String phoneNumber;

    @NotNull(message = "Gender is required")
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Past(message = "Date of birth must be in the past")
    @NotNull(message = "Date of birth is required")
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @AssertTrue(message = "Age must be between 18 and 60")
    public boolean isValidAge() {
        if (dateOfBirth == null) {
            return true;
        }
        LocalDate now = LocalDate.now();
        Period period = Period.between(dateOfBirth, now);
        int age = period.getYears();
        return age >= 18 && age <= 60;
    }

    @NotBlank(message = "Address is required")
    @Size(min = 10, max = 255, message = "Address must be between 10 and 255 characters")
    @Pattern(regexp = "^[#.0-9a-zA-Z\\s,-/]+$", message = "Address can only contain letters, numbers, spaces, and the following special characters: # . , -/")
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
    @Pattern(regexp = "^[a-zA-Z\\s]*$", message = "Department must not contain special characters or numbers")
    @Column(nullable = false)
    private String department;

    @NotBlank(message = "Designation is required")
    @Size(min = 5, max = 50, message = "Designation must be between 6 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]*$", message = "Designation must not contain special characters or numbers")
    @Column(name = "designation", nullable = false)
    private String designation;

    @NotNull(message = "basic salary is required")
    @Column(precision = 10, scale = 2)
    private BigDecimal basicSalary;

    @NotBlank(message = "Target email is required")
    @Email(message = "Invalid target email format")
    @Column(name = "target_email", nullable = false)
    private String targetEmail;

    private LocalDate leaveEndDate;

}
