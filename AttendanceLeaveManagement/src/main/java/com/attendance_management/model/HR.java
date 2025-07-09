package com.attendance_management.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;

@Entity
@Data
public class HR {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    private Employee employee;
    
    @OneToMany(mappedBy = "hr")
    private Set<Employee> managedEmployees;
}