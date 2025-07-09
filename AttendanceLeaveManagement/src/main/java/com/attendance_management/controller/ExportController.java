package com.attendance_management.controller;

import com.attendance_management.service.ExportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/export")
public class ExportController {
    private static final Logger logger = LoggerFactory.getLogger(ExportController.class);
    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    /**
     * Export attendance sheet for all employees
     * @param startDate Start date in ISO format (yyyy-MM-dd)
     * @param endDate End date in ISO format (yyyy-MM-dd)
     * @return Excel file containing attendance data
     */
    @GetMapping("/attendance-leaves")
    public ResponseEntity<byte[]> exportAttendanceSheet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] fileContent = exportService.exportAttendanceSheet(startDate, endDate);
            
            String filename = String.format("attendance_sheet_%s_to_%s.xlsx", 
                startDate.toString(), 
                endDate.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
            
        } catch (Exception e) {
            logger.error("Error generating attendance sheet", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Export attendance sheet for a specific employee
     * @param employeeId Employee ID
     * @param startDate Start date in ISO format (yyyy-MM-dd)
     * @param endDate End date in ISO format (yyyy-MM-dd)
     * @return Excel file containing attendance data for the specified employee
     */
    @GetMapping("/attendance-leaves/{employeeId}")
    public ResponseEntity<byte[]> exportAttendanceSheetForEmployee(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] fileContent = exportService.exportAttendanceSheetForEmployee(employeeId, startDate, endDate);
            
            String filename = String.format("attendance_sheet_employee_%d_%s_to_%s.xlsx", 
                employeeId,
                startDate.toString(), 
                endDate.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request parameters for employee {}: {}", employeeId, e.getMessage());
            return ResponseEntity.badRequest().build();
            
        } catch (Exception e) {
            logger.error("Error generating attendance sheet for employee " + employeeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}