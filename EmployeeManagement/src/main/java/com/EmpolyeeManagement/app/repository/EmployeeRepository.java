package com.EmpolyeeManagement.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.EmpolyeeManagement.app.model.Employee;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByEmployeeId(Long employeeId);  // Assuming Employee has an employeeId field
}
