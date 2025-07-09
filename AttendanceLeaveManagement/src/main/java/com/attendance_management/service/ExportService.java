package com.attendance_management.service;

import com.attendance_management.model.Attendance;
import com.attendance_management.model.Employee;
import com.attendance_management.model.LeaveStatus;
import com.attendance_management.repository.AttendanceRepository;
import com.attendance_management.repository.EmployeeRepository;
import com.attendance_management.repository.LeaveRequestRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.slf4j.Logger;
import java.util.ArrayList;

@Service
public class ExportService {
    private static final Logger log = LoggerFactory.getLogger(ExportService.class);
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public ExportService(EmployeeRepository employeeRepository,
                        AttendanceRepository attendanceRepository,
                        LeaveRequestRepository leaveRequestRepository) {
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    public byte[] exportAttendanceSheet(LocalDate startDate, LocalDate endDate) throws IOException {
        validateDates(startDate, endDate);
        List<Employee> employees = employeeRepository.findAll();
        return generateHorizontalWorkbook(employees, startDate, endDate);
    }

    public byte[] exportAttendanceSheetForEmployee(Long employeeId, LocalDate startDate, LocalDate endDate) 
            throws IOException {
        validateDates(startDate, endDate);
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + employeeId));
        
        List<Employee> employees = new ArrayList<>();
        employees.add(employee);
        return generateHorizontalWorkbook(employees, startDate, endDate);
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date cannot be null");
        }

        LocalDate currentDate = LocalDate.now();
        
        if (startDate.isAfter(currentDate)) {
            throw new IllegalArgumentException("Start date cannot be in the future");
        }
        
        if (endDate.isAfter(currentDate)) {
            throw new IllegalArgumentException("End date cannot exceed current date");
        }
        
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }

        // Optional: Limit the date range to prevent large exports
        if (startDate.plusMonths(3).isBefore(endDate)) {
            throw new IllegalArgumentException("Date range cannot exceed 3 months");
        }
    }

    private byte[] generateHorizontalWorkbook(List<Employee> employees, LocalDate startDate, LocalDate endDate) 
            throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Attendance Sheet");
            
            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle dateHeaderStyle = createDateHeaderStyle(workbook);

            // Create headers
            Row headerRow = sheet.createRow(0);
            String[] fixedHeaders = {"Employee ID", "Name", "Department", "Designation"};
            int columnCount = 0;

            // Add fixed column headers
            for (String header : fixedHeaders) {
                Cell cell = headerRow.createCell(columnCount++);
                cell.setCellValue(header);
                cell.setCellStyle(headerStyle);
            }

            // Add all dates between start and end date
            List<LocalDate> allDates = new ArrayList<>();
            LocalDate currentDate = startDate;
            while (!currentDate.isAfter(endDate)) {
                allDates.add(currentDate);
                currentDate = currentDate.plusDays(1);
            }

            // Add date headers
            for (LocalDate date : allDates) {
                Cell cell = headerRow.createCell(columnCount++);
                cell.setCellValue(date.format(dateFormatter));
                cell.setCellStyle(dateHeaderStyle);
            }

            // Fill employee data
            int rowNum = 1;
            for (Employee emp : employees) {
                Row row = sheet.createRow(rowNum++);
                
                // Fill fixed columns
                Cell idCell = row.createCell(0);
                idCell.setCellValue(emp.getEmployeeId());
                idCell.setCellStyle(dataStyle);

                Cell nameCell = row.createCell(1);
                nameCell.setCellValue(emp.getFullName());
                nameCell.setCellStyle(dataStyle);

                Cell deptCell = row.createCell(2);
                deptCell.setCellValue(emp.getDepartment());
                deptCell.setCellStyle(dataStyle);

                Cell desigCell = row.createCell(3);
                desigCell.setCellValue(emp.getDesignation());
                desigCell.setCellStyle(dataStyle);

                // Fill attendance data
                int dateColumn = 4;
                for (LocalDate date : allDates) {
                    Cell cell = row.createCell(dateColumn++);
                    String status = getAttendanceStatus(emp.getId(), date, startDate, endDate);
                    cell.setCellValue(status);
                    cell.setCellStyle(dataStyle);
                }
            }

            // Auto-size columns
            for (int i = 0; i < columnCount; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private String getAttendanceStatus(Long employeeId, LocalDate date, LocalDate startDate, LocalDate endDate) {
        try {
            // First check if employee is on approved leave
            boolean isOnLeave = leaveRequestRepository.existsByDateRangeAndStatus(
                employeeId,
                startDate,
                endDate,
                date,
                LeaveStatus.APPROVED
            );

            if (isOnLeave) {
                return "L";  // L for Leave
            }

            // If not on leave, check attendance for the specific date
            List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndDateBetween(
                employeeId,
                startDate,
                endDate
            ).stream()
            .filter(a -> a.getDate().equals(date))
            .toList();

            if (!attendances.isEmpty()) {
                Attendance record = attendances.get(0);
                
                return switch (record.getStatus()) {
                    case PRESENT -> String.format("P (%.1fh)", record.getWorkingHours());
                    case HALF_DAY -> String.format("H (%.1fh)", record.getWorkingHours());
                    case ABSENT -> "A";
                    default -> "A";
                };
            }

        } catch (Exception e) {
            log.error("Error getting attendance/leave status for employee {} between dates {} and {}: {}", 
                employeeId, startDate, endDate, e.getMessage(), e);
        }
        return "A";  // Default to Absent if no record found
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        style.setFont(headerFont);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createDateHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        style.setFont(headerFont);
        style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        setBorders(style);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private void setBorders(CellStyle style) {
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
}