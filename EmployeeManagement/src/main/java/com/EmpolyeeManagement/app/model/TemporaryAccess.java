package com.EmpolyeeManagement.app.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "temporary_access")
public class TemporaryAccess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne
    @JoinColumn(name = "granted_by", nullable = false)
    private Employee grantedBy;

    @Column(nullable = false)
    private String reason;

    @PrePersist
    protected void onCreate() {
        if (grantedBy != null && grantedBy.getRole() != EmployeeRole.HR) {
            throw new IllegalStateException("Only HR can grant temporary access");
        }
        if (employee != null && employee.getRole() != EmployeeRole.HR) {
            throw new IllegalStateException("Temporary access can only be granted to HR employees");
        }
    }
}