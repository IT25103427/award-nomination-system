package com.awardsystem.voting.dto;

import jakarta.validation.constraints.NotNull;

public class VoteCastRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Nomination ID is required")
    private Long nominationId;

    public VoteCastRequest() {
    }

    public VoteCastRequest(Long categoryId, Long nominationId) {
        this.categoryId = categoryId;
        this.nominationId = nominationId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getNominationId() {
        return nominationId;
    }

    public void setNominationId(Long nominationId) {
        this.nominationId = nominationId;
    }
}
