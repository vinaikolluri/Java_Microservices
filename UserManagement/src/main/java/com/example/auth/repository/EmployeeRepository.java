package com.example.auth.repository;

import com.example.auth.model.Employee;
import com.example.auth.model.EmployeeStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeId(Long employeeId);

    List<Employee> findByStatus(EmployeeStatus status);

    Optional<Employee> findTopByOrderByEmployeeIdDesc();

    boolean existsByEmail(String email);
}