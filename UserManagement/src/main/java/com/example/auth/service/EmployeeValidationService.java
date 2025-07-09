package com.example.auth.service;

import com.example.auth.model.Employee;
import com.example.auth.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;


@Service
public class EmployeeValidationService {



    public void validateNewEmployee(Employee employee) {
        if (employee == null) {
            throw new ApiException("Employee cannot be null", HttpStatus.BAD_REQUEST);
        }

        // Validate required fields
        if (employee.getFullName() == null || employee.getFullName().trim().isEmpty()) {
            throw new ApiException("First name is required", HttpStatus.BAD_REQUEST);
        }

        if (employee.getEmail() == null || employee.getEmail().trim().isEmpty()) {
            throw new ApiException("Email is required", HttpStatus.BAD_REQUEST);
        }

        if (employee.getPassword() == null || employee.getPassword().trim().isEmpty()) {
            throw new ApiException("Password is required", HttpStatus.BAD_REQUEST);
        }

        // Validate phone number format
        validatePhoneNumber(employee.getPhoneNumber());

        if (employee.getEmployeeId() == null) {
            throw new ApiException("Employee ID is required", HttpStatus.BAD_REQUEST);
        }

        if (employee.getDepartment() == null || employee.getDepartment().trim().isEmpty()) {
            throw new ApiException("Department is required", HttpStatus.BAD_REQUEST);
        }

        if (employee.getDesignation() == null || employee.getDesignation().trim().isEmpty()) {
            throw new ApiException("Designation is required", HttpStatus.BAD_REQUEST);
        }

        if (employee.getEmployeeType() == null) {
            throw new ApiException("Employee type is required", HttpStatus.BAD_REQUEST);
        }

        if (employee.getRole() == null) {
            throw new ApiException("Role is required", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateUpdateEmployee(Employee employee) {
        if (employee == null) {
            throw new ApiException("Employee cannot be null", HttpStatus.BAD_REQUEST);
        }

        // For updates, only validate the fields that are provided
        if (employee.getPhoneNumber() != null && !employee.getPhoneNumber().trim().isEmpty()) {
            validatePhoneNumber(employee.getPhoneNumber());
        }

        // Add other update validations as needed
    }

    private void validatePhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            throw new ApiException("Phone number is required", HttpStatus.BAD_REQUEST);
        }

        // E.164 format validation: +[country code][number]
        String phoneRegex = "^\\+[1-9]\\d{9,14}$";
        if (!phoneNumber.matches(phoneRegex)) {
            throw new ApiException(
                "Phone number must be in E.164 format (e.g., +1234567890). " +
                "Must start with + followed by country code and number (10-15 digits total)", 
                HttpStatus.BAD_REQUEST
            );
        }
    }
} 