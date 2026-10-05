package com.awardsystem.results.dto;

import jakarta.validation.constraints.NotNull;

public class PublishWinnerRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    public PublishWinnerRequest() {
    }

    public PublishWinnerRequest(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}
