package com.awardsystem.nomination.dto;

import com.awardsystem.nomination.NominationStatus;

import java.time.LocalDateTime;

public class PublicStatusLookupDto {
    private String referenceNumber;
    private String nomineeName;
    private String categoryName;
    private NominationStatus status;
    private boolean isWinner;
    private String statusDescription;
    private int currentStage;
    private LocalDateTime submittedAt;

    public PublicStatusLookupDto() {
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getNomineeName() {
        return nomineeName;
    }

    public void setNomineeName(String nomineeName) {
        this.nomineeName = nomineeName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public NominationStatus getStatus() {
        return status;
    }

    public void setStatus(NominationStatus status) {
        this.status = status;
    }

    public boolean isWinner() {
        return isWinner;
    }

    public void setWinner(boolean winner) {
        isWinner = winner;
    }

    public String getStatusDescription() {
        return statusDescription;
    }

    public void setStatusDescription(String statusDescription) {
        this.statusDescription = statusDescription;
    }

    public int getCurrentStage() {
        return currentStage;
    }

    public void setCurrentStage(int currentStage) {
        this.currentStage = currentStage;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
