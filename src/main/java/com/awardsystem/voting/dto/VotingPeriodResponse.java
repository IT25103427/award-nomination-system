package com.awardsystem.voting.dto;

import com.awardsystem.voting.PeriodStatus;
import com.awardsystem.voting.VotingPeriod;

import java.time.LocalDateTime;

public class VotingPeriodResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private PeriodStatus status;
    private Long setById;
    private String setByName;
    private boolean currentlyActive;

    public VotingPeriodResponse() {
    }

    public static VotingPeriodResponse fromEntity(VotingPeriod vp) {
        VotingPeriodResponse dto = new VotingPeriodResponse();
        dto.setId(vp.getId());
        if (vp.getCategory() != null) {
            dto.setCategoryId(vp.getCategory().getId());
            dto.setCategoryName(vp.getCategory().getName());
        } else {
            dto.setCategoryName("All Categories (Global)");
        }
        dto.setStartDate(vp.getStartDate());
        dto.setEndDate(vp.getEndDate());
        dto.setStatus(vp.getStatus());
        if (vp.getSetBy() != null) {
            dto.setSetById(vp.getSetBy().getId());
            dto.setSetByName(vp.getSetBy().getFullName());
        }
        LocalDateTime now = LocalDateTime.now();
        dto.setCurrentlyActive(vp.getStatus() == PeriodStatus.OPEN &&
                now.isAfter(vp.getStartDate()) && now.isBefore(vp.getEndDate()));
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
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

    public Long getSetById() {
        return setById;
    }

    public void setSetById(Long setById) {
        this.setById = setById;
    }

    public String getSetByName() {
        return setByName;
    }

    public void setSetByName(String setByName) {
        this.setByName = setByName;
    }

    public boolean isCurrentlyActive() {
        return currentlyActive;
    }

    public void setCurrentlyActive(boolean currentlyActive) {
        this.currentlyActive = currentlyActive;
    }
}
