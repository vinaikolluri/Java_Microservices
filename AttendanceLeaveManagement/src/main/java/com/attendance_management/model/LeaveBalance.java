package com.attendance_management.model;

import jakarta.persistence.*;
import lombok.Data;
import jakarta.validation.constraints.Min;

@Data
@Entity
@Table(name = "leave_balances",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"employee_id", "leave_type", "year"})
    })
public class LeaveBalance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type")
    private LeaveType leaveType;

    @Min(value = 0, message = "Total leaves cannot be negative")
    @Column(nullable = false)
    private Integer totalLeaves = 12; // Each type gets 12 leaves

    @Min(value = 0, message = "Used leaves cannot be negative")
    @Column(nullable = false)
    private Integer usedLeaves = 0;

    @Min(value = 0, message = "Remaining leaves cannot be negative")
    @Column(nullable = false)
    private Integer remainingLeaves = 12;

    @Column(nullable = false)
    private Integer year;
}