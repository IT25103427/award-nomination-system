package com.awardsystem.results.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DiscrepancyEscalationRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Escalation notes describing discrepancy are required")
    private String escalationNotes;

    public DiscrepancyEscalationRequest() {
    }

    public DiscrepancyEscalationRequest(Long categoryId, String escalationNotes) {
        this.categoryId = categoryId;
        this.escalationNotes = escalationNotes;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getEscalationNotes() {
        return escalationNotes;
    }

    public void setEscalationNotes(String escalationNotes) {
        this.escalationNotes = escalationNotes;
    }
}
