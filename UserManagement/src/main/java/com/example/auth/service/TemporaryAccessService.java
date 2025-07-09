package com.example.auth.service;

import com.example.auth.dto.TemporaryAccessRequestDto;
import com.example.auth.exception.ApiException;
import com.example.auth.model.Employee;
import com.example.auth.model.EmployeeRole;
import com.example.auth.model.TemporaryAccess;
import com.example.auth.repository.EmployeeRepository;
import com.example.auth.repository.TemporaryAccessRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TemporaryAccessService {

    private static final int MAX_CONCURRENT_ACCESS = 2;

    private final TemporaryAccessRepository temporaryAccessRepository;
    private final EmployeeRepository employeeRepository;

    public TemporaryAccessService(TemporaryAccessRepository temporaryAccessRepository,
                                EmployeeRepository employeeRepository) {
        this.temporaryAccessRepository = temporaryAccessRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public TemporaryAccess grantTemporaryAccess(TemporaryAccessRequestDto requestDto, String grantedByEmail) {
        // Find and validate the HR who is granting access
    	grantedByEmail = "admin@example.com";
        Employee admin = employeeRepository.findByEmail(grantedByEmail)
            .orElseThrow(() -> new ApiException("Admin not found", HttpStatus.NOT_FOUND));

        if (admin.getRole() != EmployeeRole.ADMIN) {
            throw new ApiException("Only Admin can grant temporary access", HttpStatus.FORBIDDEN);
        }

        // Find and validate the employee who is receiving access
        Employee employee = employeeRepository.findByEmployeeId(requestDto.getEmployeeId())
            .orElseThrow(() -> new ApiException("Employee not found with ID: " + requestDto.getEmployeeId(), 
                HttpStatus.NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();

        // Check if employee already has active access
        if (temporaryAccessRepository.hasActiveAccess(employee.getId(), now)) {
            throw new ApiException(
                String.format("Employee with ID %d already has active temporary access", employee.getEmployeeId()),
                HttpStatus.CONFLICT
            );
        }

        // Validate end time
        if (requestDto.getEndTime() == null || requestDto.getEndTime().isBefore(now)) {
            throw new ApiException("End time must be in the future", HttpStatus.BAD_REQUEST);
        }

        // Check current active temporary accesses
        List<TemporaryAccess> activeAccesses = temporaryAccessRepository.findAllActiveAccesses(now);
        
        if (activeAccesses.size() >= MAX_CONCURRENT_ACCESS) {
            // Check if any current access is about to expire
            boolean hasNearExpiryAccess = activeAccesses.stream()
                .anyMatch(access -> access.getEndTime().isBefore(now.plusHours(24)));
                
            if (!hasNearExpiryAccess) {
                throw new ApiException(
                    "Maximum number of concurrent temporary accesses (2) reached. " +
                    "Please wait for existing accesses to expire.", 
                    HttpStatus.CONFLICT
                );
            }
        }

        // Create and save temporary access
        TemporaryAccess temporaryAccess = new TemporaryAccess();
        temporaryAccess.setEmployee(employee);
        temporaryAccess.setGrantedBy(admin);
        temporaryAccess.setReason(requestDto.getReason());
        temporaryAccess.setStartTime(now);
        temporaryAccess.setEndTime(requestDto.getEndTime());
        temporaryAccess.setActive(true);

        return temporaryAccessRepository.save(temporaryAccess);
    }
}