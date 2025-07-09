package com.assetTracking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assets", uniqueConstraints = @UniqueConstraint(columnNames = "serial_no"))
@Data
@NoArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Employee ID is required")
    @Min(value = 1, message = "Employee ID must be a positive number")
    @Column(name = "employee_id", nullable = false, unique = true)
    private Long employeeId;

    @NotBlank(message = "Serial number is required")
    @Size(max = 50, message = "Serial number must not exceed 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "Serial number must not contain special characters")
    @Column(name = "serial_no", unique = true, nullable = false)
    private String serialNo;

    @NotBlank(message = "Brand is required")
    @Size(max = 30, message = "Brand must not exceed 30 characters")
    @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "Brand must not contain special characters")
    private String brand;

    @NotBlank(message = "RAM specification is required")
    @Pattern(regexp = "\\d+GB", message = "RAM must be specified in GB (e.g., 8GB, 16GB)")
    private String ram;

    @NotBlank(message = "ROM specification is required")
    @Pattern(regexp = "\\d+GB|\\d+TB", message = "ROM must be specified in GB or TB (e.g., 256GB, 1TB)")
    private String rom;

    @NotBlank(message = "Processor is required")
    @Size(max = 50, message = "Processor details must not exceed 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s]*$", message = "Processor must not contain special characters")
    private String processor;

    @NotNull(message = "Date of issue is required")
    @PastOrPresent(message = "Date of issue cannot be in the future")
    @Column(name = "date_of_issue", nullable = false)
    private LocalDate dateOfIssue;

    @ElementCollection
    @Size(max = 10, message = "Accessories list cannot have more than 10 items")
    private List<@NotBlank(message = "Accessory name cannot be blank") @Pattern(regexp = "^[a-zA-Z0-9,\\s]*$", message = "Accessory name must not contain special characters") String> accessories = new ArrayList<>();
}