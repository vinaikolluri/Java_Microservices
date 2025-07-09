package com.example.auth.service;

import com.example.auth.model.Employee;
import com.example.auth.model.EmployeeStatus;
import com.example.auth.repository.EmployeeRepository;

import jakarta.persistence.EntityNotFoundException;

import com.example.auth.exception.ResourceNotFoundException;
import com.example.auth.client.NotificationServiceClient;
import com.example.auth.dto.EmployeeUpdateDto;
import com.example.auth.dto.UserCredentialsDTO;
import com.example.auth.exception.ApiException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import java.time.LocalDate;
import java.time.Period;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;

@Service
@Transactional
@CacheConfig(cacheNames = "employees")
public class EmployeeService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationServiceClient notificationClient;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            EmployeeValidationService validationService,
            NotificationServiceClient notificationClient) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationClient = notificationClient;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found with email: " + email));

        if (employee.getStatus() == EmployeeStatus.INACTIVE || employee.getStatus() == EmployeeStatus.TERMINATED) {
            throw new DisabledException("Login denied: Employee status " + employee.getStatus() + " cannot login");
        }

        return new org.springframework.security.core.userdetails.User(
                employee.getEmail(),
                employee.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + employee.getRole().name())));
    }

    /**
     * Generates the next employeeId.
     * If no employee exists, returns 1001.
     */
    private Long generateEmployeeId() {
        return employeeRepository.findTopByOrderByEmployeeIdDesc()
                .map(emp -> emp.getEmployeeId() + 1)
                .orElse(1001L);
    }

    @CachePut(key = "#result.employeeId")
    @Transactional
    public Employee registerEmployee(Employee employee) {
        if (employeeRepository.findByEmail(employee.getEmail()).isPresent()) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        // Check if employeeId is provided and already exists
        if (employee.getEmployeeId() != null) {
            if (employeeRepository.findByEmployeeId(employee.getEmployeeId()).isPresent()) {
                throw new ApiException("Employee ID already exists", HttpStatus.CONFLICT);
            }
        } else {
            // Auto-generate employeeId if not provided
            employee.setEmployeeId(generateEmployeeId());
        }
        
        // Verify that the difference between dateOfBirth and dateOfJoining is at least 18 years
        if (employee.getDateOfBirth() != null && employee.getDateOfJoining() != null) {
            int ageAtJoining = Period.between(employee.getDateOfBirth(), employee.getDateOfJoining()).getYears();
            if (ageAtJoining < 18) {
                throw new ApiException("Employee must be at least 18 years old at the time of joining", HttpStatus.BAD_REQUEST);
            }
        }
        
        // Store original password before encryption
        String originalPassword = employee.getPassword();
        // Encrypt the password for storage
        employee.setPassword(passwordEncoder.encode(originalPassword));

        // Save the employee
        Employee savedEmployee = employeeRepository.save(employee);

        // Send credentials
        try {
            UserCredentialsDTO credentials = new UserCredentialsDTO();
            credentials.setEmployeeId(savedEmployee.getEmployeeId());
            credentials.setEmail(savedEmployee.getEmail());
            credentials.setFullName(savedEmployee.getFullName());
            credentials.setPassword(originalPassword); // Send original password

            log.debug("Attempting to send credentials to: {}", savedEmployee.getTargetEmail());
            notificationClient.sendCredentials(savedEmployee.getTargetEmail(), credentials);
            log.info("Credentials sent successfully to: {}", savedEmployee.getTargetEmail());
        } catch (Exception e) {
            log.error("Failed to send credentials: {}", e.getMessage(), e);
            // Don't throw the exception as registration was successful
        }

        return savedEmployee;
    }

    public void sendEmployeeCredentials(Long employeeId) {
        // Find the employee
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ApiException("Employee not found with ID: " + employeeId, HttpStatus.NOT_FOUND));

        try {
            UserCredentialsDTO credentials = new UserCredentialsDTO();
            credentials.setEmployeeId(employee.getEmployeeId());
            credentials.setEmail(employee.getEmail());
            credentials.setFullName(employee.getFullName());
            credentials.setPassword(employee.getPassword()); // This will be the original password from registration

            // Send to the stored target email
            notificationClient.sendCredentials(employee.getTargetEmail(), credentials);
            log.info("Credentials sent successfully to: {}", employee.getTargetEmail());
        } catch (Exception e) {
            log.error("Failed to send credentials email to {}: {}", employee.getTargetEmail(), e.getMessage(), e);
            throw new ApiException("Failed to send credentials: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @CacheEvict(key = "#employeeId")
    @Transactional
    public Employee updateEmployeeById(Long employeeId, EmployeeUpdateDto updatedEmployee) {
        try {
            Employee existingEmployee = employeeRepository.findByEmployeeId(employeeId)
                    .orElseThrow(
                            () -> new EntityNotFoundException("Employee not found with employeeId: " + employeeId));

            // Update only if new value is provided
            if (updatedEmployee.getBasicSalary() != null) {
                existingEmployee.setBasicSalary(updatedEmployee.getBasicSalary());
            }
            if (updatedEmployee.getStatus() != null) {
                existingEmployee.setStatus(updatedEmployee.getStatus());
            }
            if (updatedEmployee.getDepartment() != null) {
                existingEmployee.setDepartment(updatedEmployee.getDepartment());
            }
            if (updatedEmployee.getDesignation() != null) {
                existingEmployee.setDesignation(updatedEmployee.getDesignation());
            }

            Employee savedEmployee = employeeRepository.saveAndFlush(existingEmployee);
            log.info("Employee {} updated successfully", employeeId);
            return savedEmployee;

        } catch (EntityNotFoundException e) {
            log.error("Employee not found: {}", employeeId);
            throw e;
        } catch (Exception e) {
            log.error("Error updating employee {}: {}", employeeId, e.getMessage());
            throw new ApiException("Failed to update employee: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Cacheable(cacheNames = "allEmployees")
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Cacheable(key = "#employeeId")
    public Employee getEmployeeById(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
    }

    @Cacheable(key = "#email")
    public Employee getEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));
    }

    @CacheEvict(key = "#employeeId")
    @Transactional
    public void deleteEmployee(Long employeeId) {
        employeeRepository.deleteById(employeeId);
    }

    // This scheduled method runs every day at midnight.
    @Scheduled(cron = "0 0 0 * * ?")
    public void updateEmployeeStatusAfterLeave() {
        List<Employee> employeesOnLeave = employeeRepository.findByStatus(EmployeeStatus.ON_LEAVE);
        LocalDate today = LocalDate.now();
        for (Employee employee : employeesOnLeave) {
            if (employee.getLeaveEndDate() != null && !employee.getLeaveEndDate().isAfter(today)) {
                employee.setStatus(EmployeeStatus.ACTIVE);
                employeeRepository.save(employee);
                log.info("Employee {} status updated to ACTIVE as leave period ended.", employee.getEmployeeId());
            }
        }
    }

    @CacheEvict(cacheNames = "employees", allEntries = true)
    @Scheduled(cron = "0 0 0 * * ?")
    public void clearCache() {
        // This method will clear all cached employee data at midnight
    }
}