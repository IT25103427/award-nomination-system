package com.awardsystem.results.dto;

import jakarta.validation.constraints.NotNull;

public class VerificationSignoffRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String notes;

    public VerificationSignoffRequest() {
    }

    public VerificationSignoffRequest(Long categoryId, String notes) {
        this.categoryId = categoryId;
        this.notes = notes;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
