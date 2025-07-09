package com.example.auth.config;

import com.example.auth.model.Employee;
import com.example.auth.model.EmployeeRole;
import com.example.auth.model.EmployeeStatus;
import com.example.auth.model.EmployeeType;
import com.example.auth.model.Gender;
import com.example.auth.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.math.BigDecimal;

@Component
public class InitialDataLoader implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public InitialDataLoader(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            if (employeeRepository.findByEmail("admin@gmail.com").isEmpty()) {
                Employee admin = new Employee();
                
                // Basic Info
                admin.setEmail("admin@gmail.com");
                admin.setPassword(passwordEncoder.encode("@Admin123"));
                admin.setFullName("Admin Hrms");

                admin.setPhoneNumber("+917234567890");
                admin.setEmployeeId(1001L);
                
                // Job Details
                admin.setRole(EmployeeRole.ADMIN);
                admin.setStatus(EmployeeStatus.ACTIVE);
                admin.setDepartment("Admin");
                admin.setDesignation("Admin");
                admin.setEmployeeType(EmployeeType.FULL_TIME);
                admin.setDateOfJoining(LocalDate.now());
                
                // Additional Details
                admin.setGender(Gender.MALE);
                admin.setDateOfBirth(LocalDate.of(1990, 1, 1));
                admin.setAddress("123 HR Street, Corporate Building");
                
                // Financial Details
                admin.setBasicSalary(new BigDecimal("75000.00"));
                
                admin.setTargetEmail("admin123@gmail.com");
                
                employeeRepository.save(admin);
                System.out.println("Admin initialized successfully");
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}