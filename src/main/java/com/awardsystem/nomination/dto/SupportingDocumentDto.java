package com.awardsystem.nomination.dto;

import com.awardsystem.nomination.SupportingDocument;

import java.time.LocalDateTime;

public class SupportingDocumentDto {
    private Long id;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;

    public SupportingDocumentDto() {
    }

    public static SupportingDocumentDto fromEntity(SupportingDocument doc) {
        SupportingDocumentDto dto = new SupportingDocumentDto();
        dto.setId(doc.getId());
        dto.setFileName(doc.getFileName());
        dto.setFilePath(doc.getFilePath());
        dto.setFileType(doc.getFileType());
        dto.setFileSize(doc.getFileSize());
        dto.setUploadedAt(doc.getUploadedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
