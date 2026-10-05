package com.awardsystem.approval.dto;

import com.awardsystem.approval.ReviewDecision;
import jakarta.validation.constraints.NotNull;

public class ReviewRequest {

    @NotNull(message = "Nomination ID is required")
    private Long nominationId;

    @NotNull(message = "Review decision is required (APPROVED or REJECTED)")
    private ReviewDecision decision;

    private String comments;

    public ReviewRequest() {
    }

    public ReviewRequest(Long nominationId, ReviewDecision decision, String comments) {
        this.nominationId = nominationId;
        this.decision = decision;
        this.comments = comments;
    }

    public Long getNominationId() {
        return nominationId;
    }

    public void setNominationId(Long nominationId) {
        this.nominationId = nominationId;
    }

    public ReviewDecision getDecision() {
        return decision;
    }

    public void setDecision(ReviewDecision decision) {
        this.decision = decision;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
