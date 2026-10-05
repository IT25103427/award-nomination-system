package com.awardsystem.notification.dto;

import jakarta.validation.constraints.NotBlank;

public class ReportFilterRequest {

    @NotBlank(message = "Report title is required")
    private String title;

    @NotBlank(message = "Report type is required (NOMINATIONS, VOTING, OUTCOMES)")
    private String reportType;

    private Long categoryId;

    private String status;

    private String startDate;

    private String endDate;

    public ReportFilterRequest() {
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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
}
