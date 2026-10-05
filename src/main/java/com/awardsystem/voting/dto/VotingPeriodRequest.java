package com.awardsystem.voting.dto;

import com.awardsystem.voting.PeriodStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class VotingPeriodRequest {

    private Long categoryId; // Optional: null means global period

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    private PeriodStatus status = PeriodStatus.SCHEDULED;

    public VotingPeriodRequest() {
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public PeriodStatus getStatus() {
        return status;
    }

    public void setStatus(PeriodStatus status) {
        this.status = status;
    }
}
