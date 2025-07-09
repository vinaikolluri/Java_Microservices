package com.documentManagement.service;

import com.documentManagement.dto.FileDownloadResponse;
import com.documentManagement.entity.FileEntity;
import com.documentManagement.repository.FileRepository;
import com.documentManagement.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.sync.ResponseTransformer;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.ArrayList;

@Service
@Transactional
public class FileService {
    private final FileRepository fileRepository;
    private final EmployeeRepository employeeRepository;
    private final S3Client s3Client;
    private final String bucketName;

    private static final Set<String> ALLOWED_DOCUMENT_FORMATS = Set.of(
        "image/jpeg", "image/jpg", "image/png", "application/pdf"
    );

    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

    private static final Set<String> EDUCATIONAL_DOC_TYPES = Set.of(
        "SSC", "INTERMEDIATE", "GRADUATION"
    );

    private static final Set<String> SINGLE_FILE_DOC_TYPES = Set.of(
        "AADHAR", "PAN", "SSC", "INTERMEDIATE", "GRADUATION"
    );

    // Constructor
    public FileService(FileRepository fileRepository, 
                      EmployeeRepository employeeRepository, 
                      S3Client s3Client, 
                      @Value("${aws.s3.bucket}") String bucketName) {
        this.fileRepository = fileRepository;
        this.employeeRepository = employeeRepository;
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    // Helper method to determine content type
    private String determineContentType(String fileName) {
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".pdf")) {
            return "application/pdf";
        } else {
            return "application/octet-stream";
        }
    }
    

    // Improved upload method with validation
    public FileEntity uploadDocument(Long employeeId, MultipartFile file, String docType) throws Exception {
        validateEmployee(employeeId);
        validateFile(file);
        validateDocumentType(docType);

        String upperDocType = docType.toUpperCase();
        
        // Check if document type allows only single file
        if (SINGLE_FILE_DOC_TYPES.contains(upperDocType)) {
            List<FileEntity> existingFiles = fileRepository.findByEmployeeIdAndDocumentType(employeeId, upperDocType);
            if (!existingFiles.isEmpty()) {
                throw new IllegalArgumentException(
                    "Document of type " + docType + " already exists. Please use update instead.");
            }
        }

        String key = generateS3Key(employeeId, upperDocType, file.getOriginalFilename(), null);
        
        try {
            // Upload to S3
            uploadFileToS3(file, key);

            // Save metadata to database
            FileEntity fileEntity = new FileEntity();
            fileEntity.setFileName(file.getOriginalFilename());
            fileEntity.setFileType(file.getContentType());
            fileEntity.setS3Key(key);
            fileEntity.setFileSize(file.getSize());
            fileEntity.setEmployeeId(employeeId);
            fileEntity.setDocumentType(docType.toUpperCase());
            
            return fileRepository.save(fileEntity);
        } catch (Exception e) {
            throw new Exception("Failed to upload document: " + e.getMessage(), e);
        }
    }

    // Improved download method
    public FileDownloadResponse downloadDocument(Long employeeId, String docType) throws Exception {
        validateEmployee(employeeId);
        validateDocumentType(docType);

        FileEntity fileEntity = fileRepository.findByEmployeeIdAndDocumentType(employeeId, docType.toUpperCase())
            .stream()
            .findFirst()
            .orElseThrow(() -> new EntityNotFoundException("Document not found"));

        byte[] content = downloadFileFromS3(fileEntity.getS3Key());
        return new FileDownloadResponse(
            content,
            fileEntity.getFileName(),
            determineContentType(fileEntity.getFileName())
        );
    }

    // Improved delete method
    public void deleteDocument(Long employeeId, String docType) throws Exception {
        validateEmployee(employeeId);
        validateDocumentType(docType);

        List<FileEntity> files = fileRepository.findByEmployeeIdAndDocumentType(employeeId, docType.toUpperCase());
        if (files.isEmpty()) {
            throw new EntityNotFoundException("Document not found");
        }

        for (FileEntity file : files) {
            deleteFileFromS3(file.getS3Key());
            fileRepository.delete(file);
        }
    }

    // Helper methods
    private void validateEmployee(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Employee ID cannot be null");
        }
        employeeRepository.findByEmployeeId(employeeId)
            .orElseThrow(() -> new EntityNotFoundException(
                String.format("Employee not found with ID: %d", employeeId)
            ));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        validateFileFormat(file);
        validateFileSize(file);
    }

    private void validateFileFormat(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_DOCUMENT_FORMATS.contains(contentType)) {
            throw new IllegalArgumentException(
                "Invalid file format. Allowed formats are: " + String.join(", ", ALLOWED_DOCUMENT_FORMATS));
        }
    }

    private void validateFileSize(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                "File size exceeds maximum limit of " + (MAX_FILE_SIZE / (1024 * 1024)) + "MB");
        }
    }

    private void validateDocumentType(String docType) {
        String upperDocType = docType.toUpperCase();
        if (!SINGLE_FILE_DOC_TYPES.contains(upperDocType) && 
            !EDUCATIONAL_DOC_TYPES.contains(upperDocType) && 
            !"EXPERIENCE".equals(upperDocType)) {
            throw new IllegalArgumentException(
                "Invalid document type. Allowed types are: " + 
                String.join(", ", SINGLE_FILE_DOC_TYPES) + ", EXPERIENCE");
        }
    }

    private String generateS3Key(Long employeeId, String docType, String originalFilename, Long fileId) {
        String timestamp = String.valueOf(fileId != null ? fileId : System.currentTimeMillis());
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        
        // Check if it's an educational document
        if (EDUCATIONAL_DOC_TYPES.contains(docType.toUpperCase())) {
            return String.format("%d/EDUCATION/%s/%s_%s%s", 
                employeeId,           // First level: Employee ID
                docType.toUpperCase(),// Second level: Document type (SSC/INTERMEDIATE/GRADUATION)
                docType.toUpperCase(),// File prefix
                timestamp,           // Unique timestamp
                extension           // Original file extension
            );
        }
        
        // For non-educational documents (AADHAR, PAN, EXPERIENCE)
        return String.format("%d/%s/%s_%s%s", 
            employeeId, 
            docType.toUpperCase(), 
            docType.toUpperCase(), 
            timestamp, 
            extension
        );
    }

    private void uploadFileToS3(MultipartFile file, String key) throws IOException {
        s3Client.putObject(PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build(),
            RequestBody.fromBytes(file.getBytes()));
    }

    private void deleteFileFromS3(String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build());
    }

    private byte[] downloadFileFromS3(String key) throws Exception {
        return s3Client.getObject(GetObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build(),
            ResponseTransformer.toBytes())
            .asByteArray();
    }
    public List<FileEntity> getAllFiles() {
        return fileRepository.findAll();
    }

    // Single Document Operations
    public FileEntity uploadAadhar(Long employeeId, MultipartFile file) throws Exception {
        return uploadDocument(employeeId, file, "AADHAR");
    }

    public FileDownloadResponse downloadAadhar(Long employeeId) throws Exception {
        return downloadDocument(employeeId, "AADHAR");
    }

    public FileEntity updateAadhar(Long employeeId, MultipartFile file) throws Exception {
        deleteDocument(employeeId, "AADHAR");
        return uploadDocument(employeeId, file, "AADHAR");
    }

    public void deleteAadhar(Long employeeId) throws Exception {
        deleteDocument(employeeId, "AADHAR");
    }

    // PAN Document Operations
    public FileEntity uploadPan(Long employeeId, MultipartFile file) throws Exception {
        return uploadDocument(employeeId, file, "PAN");
    }

    public FileDownloadResponse downloadPan(Long employeeId) throws Exception {
        return downloadDocument(employeeId, "PAN");
    }

    public FileEntity updatePan(Long employeeId, MultipartFile file) throws Exception {
        deleteDocument(employeeId, "PAN");
        return uploadDocument(employeeId, file, "PAN");
    }

    public void deletePan(Long employeeId) throws Exception {
        deleteDocument(employeeId, "PAN");
    }

    // SSC Document Operations
    public FileEntity uploadSSC(Long employeeId, MultipartFile file) throws Exception {
        return uploadDocument(employeeId, file, "SSC");
    }

    public FileDownloadResponse downloadSSC(Long employeeId) throws Exception {
        return downloadDocument(employeeId, "SSC");
    }

    public FileEntity updateSSC(Long employeeId, MultipartFile file) throws Exception {
        deleteDocument(employeeId, "SSC");
        return uploadDocument(employeeId, file, "SSC");
    }

    public void deleteSSC(Long employeeId) throws Exception {
        deleteDocument(employeeId, "SSC");
    }

    // Intermediate Document Operations
    public FileEntity uploadIntermediate(Long employeeId, MultipartFile file) throws Exception {
        return uploadDocument(employeeId, file, "INTERMEDIATE");
    }

    public FileDownloadResponse downloadIntermediate(Long employeeId) throws Exception {
        return downloadDocument(employeeId, "INTERMEDIATE");
    }

    public FileEntity updateIntermediate(Long employeeId, MultipartFile file) throws Exception {
        deleteDocument(employeeId, "INTERMEDIATE");
        return uploadDocument(employeeId, file, "INTERMEDIATE");
    }

    public void deleteIntermediate(Long employeeId) throws Exception {
        deleteDocument(employeeId, "INTERMEDIATE");
    }

    // Graduation Document Operations
    public FileEntity uploadGraduation(Long employeeId, MultipartFile file) throws Exception {
        return uploadDocument(employeeId, file, "GRADUATION");
    }

    public FileDownloadResponse downloadGraduation(Long employeeId) throws Exception {
        return downloadDocument(employeeId, "GRADUATION");
    }

    public FileEntity updateGraduation(Long employeeId, MultipartFile file) throws Exception {
        deleteDocument(employeeId, "GRADUATION");
        return uploadDocument(employeeId, file, "GRADUATION");
    }

    public void deleteGraduation(Long employeeId) throws Exception {
        deleteDocument(employeeId, "GRADUATION");
    }

    // Experience Document Operations (Multiple Files)
    public List<FileEntity> uploadExperience(Long employeeId, List<MultipartFile> files) throws Exception {
        validateEmployee(employeeId);
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("No files selected for upload");
        }

        List<FileEntity> uploadedFiles = new ArrayList<>();
        for (MultipartFile file : files) {
            validateFile(file);
            uploadedFiles.add(uploadDocument(employeeId, file, "EXPERIENCE"));
        }
        return uploadedFiles;
    }

    public List<FileDownloadResponse> downloadExperience(Long employeeId) throws Exception {
        validateEmployee(employeeId);
        List<FileEntity> files = fileRepository.findByEmployeeIdAndDocumentType(employeeId, "EXPERIENCE");
        if (files.isEmpty()) {
            throw new EntityNotFoundException("No experience documents found");
        }

        List<FileDownloadResponse> responses = new ArrayList<>();
        for (FileEntity file : files) {
            byte[] content = downloadFileFromS3(file.getS3Key());
            responses.add(new FileDownloadResponse(
                content,
                file.getFileName(),
                determineContentType(file.getFileName())
            ));
        }
        return responses;
    }

    public List<FileEntity> updateExperience(Long employeeId, List<MultipartFile> files) throws Exception {
        validateEmployee(employeeId);
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("No files selected for update");
        }

        // Delete existing experience documents
        deleteExperience(employeeId);

        // Upload new experience documents
        return uploadExperience(employeeId, files);
    }

    public void deleteExperience(Long employeeId) throws Exception {
        validateEmployee(employeeId);
        List<FileEntity> files = fileRepository.findByEmployeeIdAndDocumentType(employeeId, "EXPERIENCE");
        if (files.isEmpty()) {
            throw new EntityNotFoundException("No experience documents found");
        }

        for (FileEntity file : files) {
            deleteFileFromS3(file.getS3Key());
            fileRepository.delete(file);
        }
    }

    // Add new download by fileId method
    public FileDownloadResponse downloadByFileId(Long fileId) throws Exception {
        FileEntity fileEntity = fileRepository.findById(fileId)
            .orElseThrow(() -> new EntityNotFoundException("File not found with ID: " + fileId));

        byte[] content = downloadFileFromS3(fileEntity.getS3Key());
        return new FileDownloadResponse(
            content,
            fileEntity.getFileName(),
            determineContentType(fileEntity.getFileName())
        );
    }

    // Add new update by fileId method
    public FileEntity updateByFileId(Long fileId, MultipartFile file) throws Exception {
        FileEntity existingFile = fileRepository.findById(fileId)
            .orElseThrow(() -> new EntityNotFoundException("File not found with ID: " + fileId));
        
        validateFile(file);
        
        // Delete existing file from S3
        deleteFileFromS3(existingFile.getS3Key());
        
        // Generate new S3 key maintaining the same structure
        String key = generateS3Key(
            existingFile.getEmployeeId(), 
            existingFile.getDocumentType(), 
            file.getOriginalFilename(),
            fileId
        );
        
        // Upload new file to S3
        uploadFileToS3(file, key);
        
        // Update entity
        existingFile.setFileName(file.getOriginalFilename());
        existingFile.setFileType(file.getContentType());
        existingFile.setS3Key(key);
        existingFile.setFileSize(file.getSize());
        
        return fileRepository.save(existingFile);
    }

    // Add new delete by fileId method
    public void deleteByFileId(Long fileId) throws Exception {
        FileEntity fileEntity = fileRepository.findById(fileId)
            .orElseThrow(() -> new EntityNotFoundException("File not found with ID: " + fileId));
        
        deleteFileFromS3(fileEntity.getS3Key());
        fileRepository.delete(fileEntity);
    }

    // Single Experience File Operations
    public FileEntity uploadExperienceFile(Long employeeId, Long fileId, MultipartFile file) throws Exception {
        validateEmployee(employeeId);
        validateFile(file);
        
        // Check if fileId already exists
        if (fileRepository.existsById(fileId)) {
            throw new IllegalArgumentException("File ID already exists: " + fileId);
        }

        String key = generateS3Key(employeeId, "EXPERIENCE", file.getOriginalFilename(), fileId);
        
        try {
            // Upload to S3
            uploadFileToS3(file, key);

            // Save metadata to database
            FileEntity fileEntity = new FileEntity();
            fileEntity.setId(fileId);
            fileEntity.setFileName(file.getOriginalFilename());
            fileEntity.setFileType(file.getContentType());
            fileEntity.setS3Key(key);
            fileEntity.setFileSize(file.getSize());
            fileEntity.setEmployeeId(employeeId);
            fileEntity.setDocumentType("EXPERIENCE");
            
            return fileRepository.save(fileEntity);
        } catch (Exception e) {
            throw new Exception("Failed to upload experience document: " + e.getMessage(), e);
        }
    }

    public FileDownloadResponse downloadExperienceFile(Long employeeId, Long fileId) throws Exception {
        validateEmployee(employeeId);
        
        FileEntity fileEntity = fileRepository.findByIdAndEmployeeIdAndDocumentType(fileId, employeeId, "EXPERIENCE")
            .orElseThrow(() -> new EntityNotFoundException(
                String.format("Experience document not found with ID: %d for employee: %d", fileId, employeeId)));

        byte[] content = downloadFileFromS3(fileEntity.getS3Key());
        return new FileDownloadResponse(
            content,
            fileEntity.getFileName(),
            determineContentType(fileEntity.getFileName())
        );
    }

    public FileEntity updateExperienceFile(Long employeeId, Long fileId, MultipartFile file) throws Exception {
        validateEmployee(employeeId);
        validateFile(file);
        
        FileEntity existingFile = fileRepository.findByIdAndEmployeeIdAndDocumentType(fileId, employeeId, "EXPERIENCE")
            .orElseThrow(() -> new EntityNotFoundException(
                String.format("Experience document not found with ID: %d for employee: %d", fileId, employeeId)));
        
        // Delete existing file from S3
        deleteFileFromS3(existingFile.getS3Key());
        
        // Generate new S3 key
        String key = generateS3Key(employeeId, "EXPERIENCE", file.getOriginalFilename(), fileId);
        
        // Upload new file to S3
        uploadFileToS3(file, key);
        
        // Update entity
        existingFile.setFileName(file.getOriginalFilename());
        existingFile.setFileType(file.getContentType());
        existingFile.setS3Key(key);
        existingFile.setFileSize(file.getSize());
        
        return fileRepository.save(existingFile);
    }

    public void deleteExperienceFile(Long employeeId, Long fileId) throws Exception {
        validateEmployee(employeeId);
        
        FileEntity fileEntity = fileRepository.findByIdAndEmployeeIdAndDocumentType(fileId, employeeId, "EXPERIENCE")
            .orElseThrow(() -> new EntityNotFoundException(
                String.format("Experience document not found with ID: %d for employee: %d", fileId, employeeId)));
        
        deleteFileFromS3(fileEntity.getS3Key());
        fileRepository.delete(fileEntity);
    }
}