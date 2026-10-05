package com.awardsystem.notification.dto;

import com.awardsystem.notification.ReportRecord;

import java.time.LocalDateTime;

public class ReportResponseDto {
    private Long id;
    private String title;
    private String reportType;
    private String parametersJson;
    private String dataJson;
    private Long generatedById;
    private String generatedByName;
    private LocalDateTime createdAt;

    public ReportResponseDto() {
    }

    public static ReportResponseDto fromEntity(ReportRecord record) {
        ReportResponseDto dto = new ReportResponseDto();
        dto.setId(record.getId());
        dto.setTitle(record.getTitle());
        dto.setReportType(record.getReportType());
        dto.setParametersJson(record.getParametersJson());
        dto.setDataJson(record.getDataJson());
        if (record.getGeneratedBy() != null) {
            dto.setGeneratedById(record.getGeneratedBy().getId());
            dto.setGeneratedByName(record.getGeneratedBy().getFullName());
        }
        dto.setCreatedAt(record.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getParametersJson() {
        return parametersJson;
    }

    public void setParametersJson(String parametersJson) {
        this.parametersJson = parametersJson;
    }

    public String getDataJson() {
        return dataJson;
    }

    public void setDataJson(String dataJson) {
        this.dataJson = dataJson;
    }

    public Long getGeneratedById() {
        return generatedById;
    }

    public void setGeneratedById(Long generatedById) {
        this.generatedById = generatedById;
    }

    public String getGeneratedByName() {
        return generatedByName;
    }

    public void setGeneratedByName(String generatedByName) {
        this.generatedByName = generatedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
