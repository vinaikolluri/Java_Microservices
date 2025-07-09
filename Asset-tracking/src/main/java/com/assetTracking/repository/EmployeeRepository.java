package com.assetTracking.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.assetTracking.model.Employee;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeId(Long employeeId);
}
