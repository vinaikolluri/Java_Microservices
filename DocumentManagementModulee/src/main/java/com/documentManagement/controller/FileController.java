package com.documentManagement.controller;

import com.documentManagement.dto.FileDownloadResponse;
import com.documentManagement.entity.FileEntity;
import com.documentManagement.service.FileService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @GetMapping("/getAllFiles")
    public ResponseEntity<?> getAllFiles() {
        try {
            List<FileEntity> files = fileService.getAllFiles();
            if (files.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving files: " + e.getMessage()));
        }
    }

    // Aadhar Document Endpoints
    @PostMapping(value = "/aadhar/upload/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAadhar(@PathVariable Long employeeId, @RequestPart("file") MultipartFile file) {
        return uploadDocument(employeeId, "AADHAR", file);
    }

    @GetMapping("/aadhar/download/{employeeId}")
    public ResponseEntity<?> downloadAadhar(@PathVariable Long employeeId) {
        return downloadDocument(employeeId, "AADHAR");
    }

    @PutMapping(value = "/aadhar/update/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateAadhar(@PathVariable Long employeeId, @RequestPart("file") MultipartFile file) {
        return updateDocument(employeeId, "AADHAR", file);
    }

    @DeleteMapping("/aadhar/delete/{employeeId}")
    public ResponseEntity<?> deleteAadhar(@PathVariable Long employeeId) {
        return deleteDocument(employeeId, "AADHAR");
    }

    // PAN Document Endpoints
    @PostMapping(value = "/pan/upload/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPan(@PathVariable Long employeeId, @RequestPart("file") MultipartFile file) {
        return uploadDocument(employeeId, "PAN", file);
    }

    @GetMapping("/pan/download/{employeeId}")
    public ResponseEntity<?> downloadPan(@PathVariable Long employeeId) {
        return downloadDocument(employeeId, "PAN");
    }

    @PutMapping(value = "/pan/update/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updatePan(@PathVariable Long employeeId, @RequestPart("file") MultipartFile file) {
        return updateDocument(employeeId, "PAN", file);
    }

    @DeleteMapping("/pan/delete/{employeeId}")
    public ResponseEntity<?> deletePan(@PathVariable Long employeeId) {
        return deleteDocument(employeeId, "PAN");
    }

    // Educational Document Endpoints
    // SSC
    @PostMapping(value = "/ssc/upload/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadSSC(@PathVariable Long employeeId, @RequestPart("file") MultipartFile file) {
        return uploadDocument(employeeId, "SSC", file);
    }

    @GetMapping("/ssc/download/{employeeId}")
    public ResponseEntity<?> downloadSSC(@PathVariable Long employeeId) {
        return downloadDocument(employeeId, "SSC");
    }

    @PutMapping(value = "/ssc/update/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateSSC(@PathVariable Long employeeId, @RequestPart("file") MultipartFile file) {
        return updateDocument(employeeId, "SSC", file);
    }

    @DeleteMapping("/ssc/delete/{employeeId}")
    public ResponseEntity<?> deleteSSC(@PathVariable Long employeeId) {
        return deleteDocument(employeeId, "SSC");
    }

    // Intermediate
    @PostMapping(value = "/intermediate/upload/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadIntermediate(@PathVariable Long employeeId, @RequestPart("file") MultipartFile file) {
        return uploadDocument(employeeId, "INTERMEDIATE", file);
    }

    @GetMapping("/intermediate/download/{employeeId}")
    public ResponseEntity<?> downloadIntermediate(@PathVariable Long employeeId) {
        return downloadDocument(employeeId, "INTERMEDIATE");
    }

    @PutMapping(value = "/intermediate/update/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateIntermediate(@PathVariable Long employeeId, @RequestPart("file") MultipartFile file) {
        return updateDocument(employeeId, "INTERMEDIATE", file);
    }

    @DeleteMapping("/intermediate/delete/{employeeId}")
    public ResponseEntity<?> deleteIntermediate(@PathVariable Long employeeId) {
        return deleteDocument(employeeId, "INTERMEDIATE");
    }

    // Graduation
    @PostMapping(value = "/graduation/upload/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadGraduation(@PathVariable Long employeeId, @RequestPart("file") MultipartFile file) {
        return uploadDocument(employeeId, "GRADUATION", file);
    }

    @GetMapping("/graduation/download/{employeeId}")
    public ResponseEntity<?> downloadGraduation(@PathVariable Long employeeId) {
        return downloadDocument(employeeId, "GRADUATION");
    }

    @PutMapping(value = "/graduation/update/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateGraduation(@PathVariable Long employeeId, @RequestPart("file") MultipartFile file) {
        return updateDocument(employeeId, "GRADUATION", file);
    }

    @DeleteMapping("/graduation/delete/{employeeId}")
    public ResponseEntity<?> deleteGraduation(@PathVariable Long employeeId) {
        return deleteDocument(employeeId, "GRADUATION");
    }

    // Experience Document Endpoints
    @PostMapping(value = "/experience/upload/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadExperience(
            @PathVariable Long employeeId, 
            @RequestPart("files") List<MultipartFile> files) {
        try {
            List<FileEntity> savedFiles = fileService.uploadExperience(employeeId, files);
            return ResponseEntity.ok(Map.of(
                "message", "Experience documents uploaded successfully",
                "files", savedFiles));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload experience documents: " + e.getMessage()));
        }
    }

    @GetMapping("/experience/download/{employeeId}/{fileId}")
    public ResponseEntity<?> downloadExperienceFile(
            @PathVariable Long employeeId,
            @PathVariable Long fileId) {
        try {
            FileDownloadResponse response = fileService.downloadExperienceFile(employeeId, fileId);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(response.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + response.getFileName() + "\"")
                    .body(response.getContent());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error downloading experience document: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/experience/update/{employeeId}/{fileId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateExperienceFile(
            @PathVariable Long employeeId,
            @PathVariable Long fileId,
            @RequestPart("file") MultipartFile file) {
        try {
            FileEntity updatedFile = fileService.updateExperienceFile(employeeId, fileId, file);
            return ResponseEntity.ok(Map.of(
                "message", "Experience document updated successfully",
                "file", updatedFile));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update experience document: " + e.getMessage()));
        }
    }

    @DeleteMapping("/experience/delete/{employeeId}/{fileId}")
    public ResponseEntity<?> deleteExperienceFile(
            @PathVariable Long employeeId,
            @PathVariable Long fileId) {
        try {
            fileService.deleteExperienceFile(employeeId, fileId);
            return ResponseEntity.ok(Map.of(
                "message", "Experience document deleted successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete experience document: " + e.getMessage()));
        }
    }

    // Utility methods
    private ResponseEntity<?> downloadDocument(Long employeeId, String docType) {
        try {
            FileDownloadResponse response = fileService.downloadDocument(employeeId, docType);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(response.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + response.getFileName() + "\"")
                    .body(response.getContent());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error downloading document: " + e.getMessage()));
        }
    }
    private ResponseEntity<?> uploadDocument(Long employeeId, String docType, MultipartFile file) {
        try {
            if (employeeId == null || employeeId <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid employee ID"));
            }

            FileEntity savedFile = fileService.uploadDocument(employeeId, file, docType);
            return ResponseEntity.ok(Map.of(
                "message", docType + " document uploaded successfully",
                "file", savedFile
            ));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "error", e.getMessage(),
                        "employeeId", employeeId
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload document: " + e.getMessage()));
        }
    }
    private ResponseEntity<?> updateDocument(Long employeeId, String docType, MultipartFile file) {
        try {
            if (employeeId == null || employeeId <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid employee ID"));
            }

            // First delete the existing document
            try {
                fileService.deleteDocument(employeeId, docType);
            } catch (EntityNotFoundException e) {
                // Ignore if document doesn't exist
            }

            // Then upload the new document
            FileEntity updatedFile = fileService.uploadDocument(employeeId, file, docType);
            return ResponseEntity.ok(Map.of(
                "message", docType + " document updated successfully",
                "file", updatedFile));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update document: " + e.getMessage()));
        }
    }
    private ResponseEntity<?> deleteDocument(Long employeeId, String docType) {
        try {
            fileService.deleteDocument(employeeId, docType);
            return ResponseEntity.ok(Map.of("message", docType + " document deleted successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete document: " + e.getMessage()));
        }
    }

}

