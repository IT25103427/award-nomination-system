package com.awardsystem.nomination;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "supporting_documents")
public class SupportingDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nomination_id", nullable = false)
    private Nomination nomination;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public SupportingDocument() {
    }

    public SupportingDocument(Nomination nomination, String fileName, String filePath, String fileType, Long fileSize) {
        this.nomination = nomination;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Nomination getNomination() {
        return nomination;
    }

    public void setNomination(Nomination nomination) {
        this.nomination = nomination;
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
