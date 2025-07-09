package com.documentManagement.dto;

public class FileDownloadResponse {
    private final byte[] content;
    private final String fileName;
    private final String contentType;

    public FileDownloadResponse(byte[] content, String fileName, String contentType) {
        this.content = content;
        this.fileName = fileName;
        this.contentType = contentType;
    }

    // Getters
    public byte[] getContent() { return content; }
    public String getFileName() { return fileName; }
    public String getContentType() { return contentType; }
}
