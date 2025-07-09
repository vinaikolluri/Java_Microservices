package com.attendance_management.service;

import com.attendance_management.client.NotificationServiceClient;
import com.attendance_management.dto.LeaveBalanceDTO;
import com.attendance_management.dto.LeaveRequestDTO;
import com.attendance_management.dto.LeaveResponseDTO;
import com.attendance_management.model.*;
import com.attendance_management.repository.LeaveRequestRepository;
import com.attendance_management.repository.LeaveBalanceRepository;
import com.attendance_management.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.ArrayList;

@Service
@Transactional
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationServiceClient notificationClient;

    @Transactional
    public void initializeLeaveBalances(Long employeeId) {
        // Validate employee exists
        employeeRepository.findByEmployeeId(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
            
        int currentYear = LocalDate.now().getYear();

        for (LeaveType type : LeaveType.values()) {
            if (!type.isUnpaid()) {
                LeaveBalance balance = new LeaveBalance();
                balance.setEmployeeId(employeeId);
                balance.setLeaveType(type);
                balance.setYear(currentYear);
                balance.setTotalLeaves(type.getDefaultYearlyQuota());
                balance.setUsedLeaves(0);
                balance.setRemainingLeaves(type.getDefaultYearlyQuota());
                leaveBalanceRepository.save(balance);
            }
        }
    }

    @Transactional
    public LeaveResponseDTO applyLeave(LeaveRequestDTO leaveRequestDTO) {
        // Validate employee exists
        employeeRepository.findByEmployeeId(leaveRequestDTO.getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found"));
            
        // Check leave availability
        checkLeaveAvailability(leaveRequestDTO.getEmployeeId(), leaveRequestDTO.getLeaveType());
        
        // Ensure leave balances exist
        ensureLeaveBalancesExist(leaveRequestDTO.getEmployeeId());
            
        // Validate dates
        validateLeaveDates(leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate(), leaveRequestDTO);
        
        // Calculate leave duration
        long leaveDays = calculateLeaveDuration(leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate());
        
        // Check leave balance
        validateLeaveBalance(leaveRequestDTO.getEmployeeId(), leaveRequestDTO.getLeaveType(), leaveDays);
        
        // Validate one leave per day
        validateOnlyOneLeavePerDay(leaveRequestDTO.getEmployeeId(), leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate(), leaveRequestDTO);
        
        // Check for overlapping approved leave requests
        validateNoOverlappingApprovedLeaves(leaveRequestDTO.getEmployeeId(), leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate());
        
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployeeId(leaveRequestDTO.getEmployeeId());
        leaveRequest.setLeaveType(leaveRequestDTO.getLeaveType());
        leaveRequest.setStartDate(leaveRequestDTO.getStartDate());
        leaveRequest.setEndDate(leaveRequestDTO.getEndDate());
        leaveRequest.setReason(leaveRequestDTO.getReason());
        leaveRequest.setStatus(LeaveStatus.PENDING);
        
        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        return convertToResponseDTO(savedRequest);
    }

    private void validateOnlyOneLeavePerDay(Long employeeId, LocalDate startDate, LocalDate endDate, LeaveRequestDTO leaveRequestDTO) {
        // If applying for SICK leave, allow it to overlap with any other leave type
        if (leaveRequestDTO.getLeaveType() == LeaveType.SICK) {
            // For SICK leave, only check if another SICK leave exists for the same dates
            List<LeaveRequest> existingSickLeaves = leaveRequestRepository
                .findByEmployeeIdAndDateRangeAndType(
                    employeeId, 
                    startDate, 
                    endDate,
                    LeaveType.SICK
                );
                
            if (!existingSickLeaves.isEmpty()) {
                throw new IllegalStateException(
                    "You already have a SICK leave request for these dates."
                );
            }
            return; // Allow SICK leave to overlap with other leave types
        }

        // For non-SICK leaves, check if any non-SICK leaves exist
        List<LeaveRequest> existingNonSickLeaves = leaveRequestRepository
            .findByEmployeeIdAndDateRangeAndTypeNot(
                employeeId, 
                startDate, 
                endDate,
                LeaveType.SICK
            );
        
        if (!existingNonSickLeaves.isEmpty()) {
            throw new IllegalStateException(
                "You already have a non-SICK leave request for these dates."
            );
        }
    }

    private void ensureLeaveBalancesExist(Long employeeId) {
        int currentYear = LocalDate.now().getYear();
        
        // Check and initialize SICK_LEAVE balance
        leaveBalanceRepository
            .findByEmployeeIdAndLeaveTypeAndYear(employeeId, LeaveType.SICK, currentYear)
            .orElseGet(() -> initializeLeaveBalance(employeeId, LeaveType.SICK, currentYear));
        
        // Check and initialize PAID_LEAVE balance
        leaveBalanceRepository
            .findByEmployeeIdAndLeaveTypeAndYear(employeeId, LeaveType.CASUAL, currentYear)
            .orElseGet(() -> initializeLeaveBalance(employeeId, LeaveType.CASUAL, currentYear));
    }

    private LeaveBalance initializeLeaveBalance(Long employeeId, LeaveType leaveType, int year) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        int proratedLeaves = calculateProratedLeaves(employee.getDateOfJoining(), year);

        LeaveBalance balance = new LeaveBalance();
        balance.setEmployeeId(employeeId);
        balance.setLeaveType(leaveType);
        balance.setYear(year);
        balance.setTotalLeaves(proratedLeaves);
        balance.setUsedLeaves(0);
        balance.setRemainingLeaves(proratedLeaves);
        return leaveBalanceRepository.save(balance);
    }

    private int calculateProratedLeaves(LocalDate dateOfJoining, int year) {
        // If joining year is before current year, employee gets full leaves
        if (dateOfJoining.getYear() < year) {
            return 12; // Full year quota
        }

        // If joining year is current year, calculate prorated leaves
        if (dateOfJoining.getYear() == year) {
            // Calculate months remaining in the year (including joining month)
            int monthsRemaining = 13 - dateOfJoining.getMonthValue(); // 13 because we include joining month
            return monthsRemaining; // 1 leave per month
        }

        // If joining year is future year, no leaves
        return 0;
    }

    private LeaveResponseDTO convertToResponseDTO(LeaveRequest leaveRequest) {
        LeaveResponseDTO dto = new LeaveResponseDTO();
        dto.setId(leaveRequest.getId());
        dto.setEmployeeId(leaveRequest.getEmployeeId());
        dto.setLeaveType(leaveRequest.getLeaveType());
        dto.setStartDate(leaveRequest.getStartDate());
        dto.setEndDate(leaveRequest.getEndDate());
        dto.setReason(leaveRequest.getReason());
        dto.setStatus(leaveRequest.getStatus());
        dto.setHrRemarks(leaveRequest.getHrRemarks());
        return dto;
    }

    public LeaveBalanceDTO convertToBalanceDTO(LeaveBalance leaveBalance) {
        LeaveBalanceDTO dto = new LeaveBalanceDTO();
        dto.setEmployeeId(leaveBalance.getEmployeeId());
        dto.setLeaveType(leaveBalance.getLeaveType());
        dto.setTotalLeaves(leaveBalance.getTotalLeaves());
        dto.setUsedLeaves(leaveBalance.getUsedLeaves());
        dto.setRemainingLeaves(leaveBalance.getRemainingLeaves());
        dto.setYear(leaveBalance.getYear());
        return dto;
    }

    // Add a method to get current leave balance
    public List<LeaveBalanceDTO> getCurrentLeaveBalance(Long employeeId) {
        int currentYear = LocalDate.now().getYear();
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, currentYear);
        
        // If no balance exists, initialize it
        if (balances.isEmpty()) {
            balances = initializeEmployeeLeaveBalances(employeeId, currentYear);
        }
        
        return balances.stream()
            .map(this::convertToBalanceDTO)
            .toList();
    }

    private List<LeaveBalance> initializeEmployeeLeaveBalances(Long employeeId, int year) {
        List<LeaveBalance> balances = new ArrayList<>();
        
        // Initialize for each paid leave type
        for (LeaveType type : LeaveType.values()) {
            if (!type.isUnpaid()) {
                LeaveBalance balance = initializeLeaveBalance(employeeId, type, year);
                balances.add(balance);
            }
        }
        
        return balances;
    }

    // Helper methods
    private void validateLeaveDates(LocalDate startDate, LocalDate endDate, LeaveRequestDTO leaveRequestDTO) {
        LocalDate today = LocalDate.now();
        
        // For SICK leaves, allow same day application
        if (leaveRequestDTO.getLeaveType() == LeaveType.SICK) {
            if (startDate.isBefore(today)) {
                throw new IllegalArgumentException("Cannot apply SICK leave for past dates");
            }
        } else if (leaveRequestDTO.getLeaveType() == LeaveType.CASUAL) {
            // For CASUAL leaves, allow one day in advance
            if (startDate.isBefore(today.plusDays(1))) {
                throw new IllegalArgumentException(
                    "CASUAL leaves must be applied at least one day in advance"
                );
            }
        } else {
            // For other leave types, must be at least one day in advance
            if (startDate.isBefore(today.plusDays(1))) {
                throw new IllegalArgumentException(
                    "Regular leaves must be applied at least one day in advance"
                );
            }
        }

        // Common validation for all leave types
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
    }

    private long calculateLeaveDuration(LocalDate startDate, LocalDate endDate) {
        return ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    private void validateLeaveBalance(Long employeeId, LeaveType leaveType, long leaveDays) {
        // Skip balance validation for unpaid leaves
        if (leaveType.isUnpaid()) {
            return;
        }

        LeaveBalance balance = leaveBalanceRepository
            .findByEmployeeIdAndLeaveTypeAndYear(employeeId, leaveType, LocalDate.now().getYear())
            .orElseThrow(() -> new RuntimeException("Leave balance not found"));
            
        if (balance.getRemainingLeaves() <= 0) {
            throw new IllegalStateException(
                String.format("No %s leaves available for the year. Used all %d leaves.", 
                    leaveType, balance.getTotalLeaves()));
        }
        
        if (balance.getRemainingLeaves() < leaveDays) {
            throw new IllegalStateException(
                String.format("Insufficient %s leave balance. Available: %d, Requested: %d",
                    leaveType, balance.getRemainingLeaves(), leaveDays));
        }
    }

    private void validateNoOverlappingApprovedLeaves(Long employeeId, LocalDate startDate, LocalDate endDate) {
        List<LeaveRequest> overlappingLeaves = leaveRequestRepository
            .findByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                employeeId, LeaveStatus.APPROVED, endDate, startDate);
        
        if (!overlappingLeaves.isEmpty()) {
            throw new IllegalStateException("Leave request overlaps with an already approved leave");
        }
    }

    @Transactional
    public LeaveRequest processLeaveRequest(Long requestId, LeaveStatus status, String remarks) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Leave request not found"));
            
        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Can only process pending leave requests");
        }
        
        request.setStatus(status);
        request.setHrRemarks(remarks);
        
        if (status == LeaveStatus.APPROVED) {
            updateLeaveBalance(request);
            
            // Only update employee status if leave starts today
            LocalDate today = LocalDate.now();
            if (request.getStartDate().equals(today)) {
                Employee employee = employeeRepository.findByEmployeeId(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
                employee.setStatus(EmployeeStatus.ON_LEAVE);
                employeeRepository.save(employee);
            }
        }

        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        try {
            LeaveResponseDTO responseDTO = mapToLeaveResponseDTO(savedRequest);
            
            if (status == LeaveStatus.APPROVED) {
                notificationClient.sendLeaveApprovalNotification(responseDTO);
            } else if (status == LeaveStatus.REJECTED) {
                notificationClient.sendLeaveRejectionNotification(responseDTO);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return savedRequest;
    }

    // Add new method for mapping to LeaveResponseDTO
    private LeaveResponseDTO mapToLeaveResponseDTO(LeaveRequest request) {
        LeaveResponseDTO dto = new LeaveResponseDTO();
        dto.setId(request.getId());
        dto.setEmployeeId(request.getEmployeeId());
        dto.setLeaveType(request.getLeaveType());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus());
        dto.setHrRemarks(request.getHrRemarks());
        return dto;
    }
    
    private void updateLeaveBalance(LeaveRequest request) {
        // Skip balance update for unpaid leaves
        if (request.getLeaveType().isUnpaid()) {
            return;
        }

        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndYear(
                        request.getEmployeeId(),
                        request.getLeaveType(),
                        LocalDate.now().getYear())
                .orElseThrow(() -> new RuntimeException("Leave balance not found"));

        // Increment used leaves by the duration of the leave
        long leaveDays = calculateLeaveDuration(request.getStartDate(), request.getEndDate());
        int newUsedLeaves = balance.getUsedLeaves() + (int) leaveDays;
        balance.setUsedLeaves(newUsedLeaves);
        balance.setRemainingLeaves(balance.getTotalLeaves() - newUsedLeaves);

        leaveBalanceRepository.save(balance);
    }

    public List<LeaveRequest> getAllLeaves(LeaveStatus status) {
        if (status != null) {
            return leaveRequestRepository.findByStatus(status);
        }
        return leaveRequestRepository.findAll();
    }

    public List<LeaveBalance> getAllLeaveBalances(int year) {
        return leaveBalanceRepository.findByYear(year);
    }

    public List<LeaveRequest> getEmployeeLeaves(Long employeeId, LeaveStatus status) {
        if (status != null) {
            return leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, status);
        }
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    public List<LeaveBalance> getEmployeeLeaveBalances(Long employeeId, int year) {
        return leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year);
    }

    private void checkLeaveAvailability(Long employeeId, LeaveType leaveType) {
        if (leaveType.isUnpaid()) {
            return;
        }

        LeaveBalance balance = leaveBalanceRepository
            .findByEmployeeIdAndLeaveTypeAndYear(employeeId, leaveType, LocalDate.now().getYear())
            .orElseGet(() -> initializeLeaveBalance(employeeId, leaveType, LocalDate.now().getYear()));

        if (balance.getRemainingLeaves() <= 0) {
            throw new IllegalStateException(
                String.format("Cannot apply for %s leave. All %d leaves for the year have been used.", 
                    leaveType, balance.getTotalLeaves()));
        }
    }

    @Scheduled(cron = "0 0 0 * * *") // Runs at midnight every day
    @Transactional
    public void updateLeaveStatuses() {
        LocalDate today = LocalDate.now();
        List<LeaveRequest> activeLeaves = leaveRequestRepository.findByStatusAndEndDateLessThanEqual(
            LeaveStatus.APPROVED, 
            today
        );

        for (LeaveRequest leave : activeLeaves) {
            // Update employee status back to ACTIVE
            Employee employee = employeeRepository.findByEmployeeId(leave.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            
            employee.setStatus(EmployeeStatus.ACTIVE);
            employeeRepository.save(employee);

            // Update leave status to COMPLETED
            leave.setStatus(LeaveStatus.COMPLETED);
            leaveRequestRepository.save(leave);
        }
    }

    @Scheduled(cron = "0 0 0 * * *") // Runs at midnight every day
    @Transactional
    public void updateEmployeeLeaveStatuses() {
        LocalDate today = LocalDate.now();
        
        // Find approved leaves that start today
        List<LeaveRequest> startingLeaves = leaveRequestRepository.findByStatusAndStartDate(
            LeaveStatus.APPROVED, 
            today
        );

        // Update employee status to ON_LEAVE for starting leaves
        for (LeaveRequest leave : startingLeaves) {
            Employee employee = employeeRepository.findByEmployeeId(leave.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            employee.setStatus(EmployeeStatus.ON_LEAVE);
            employeeRepository.save(employee);
        }

        // Find approved leaves that ended yesterday
        List<LeaveRequest> endingLeaves = leaveRequestRepository.findByStatusAndEndDate(
            LeaveStatus.APPROVED, 
            today.minusDays(1)
        );

        // Update employee status back to ACTIVE for ended leaves
        for (LeaveRequest leave : endingLeaves) {
            Employee employee = employeeRepository.findByEmployeeId(leave.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            employee.setStatus(EmployeeStatus.ACTIVE);
            leave.setStatus(LeaveStatus.COMPLETED);
            employeeRepository.save(employee);
            leaveRequestRepository.save(leave);
        }
    }
}