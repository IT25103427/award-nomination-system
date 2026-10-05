package com.awardsystem.approval.dto;

import com.awardsystem.approval.NominationReview;
import com.awardsystem.approval.ReviewDecision;

import java.time.LocalDateTime;

public class ReviewResponse {
    private Long id;
    private Long nominationId;
    private String nomineeName;
    private String referenceNumber;
    private Long reviewedById;
    private String reviewedByName;
    private ReviewDecision decision;
    private String comments;
    private LocalDateTime decidedAt;

    public ReviewResponse() {
    }

    public static ReviewResponse fromEntity(NominationReview review) {
        ReviewResponse dto = new ReviewResponse();
        dto.setId(review.getId());
        if (review.getNomination() != null) {
            dto.setNominationId(review.getNomination().getId());
            dto.setNomineeName(review.getNomination().getNomineeName());
            dto.setReferenceNumber(review.getNomination().getReferenceNumber());
        }
        if (review.getReviewedBy() != null) {
            dto.setReviewedById(review.getReviewedBy().getId());
            dto.setReviewedByName(review.getReviewedBy().getFullName());
        }
        dto.setDecision(review.getDecision());
        dto.setComments(review.getComments());
        dto.setDecidedAt(review.getDecidedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getNominationId() {
        return nominationId;
    }

    public void setNominationId(Long nominationId) {
        this.nominationId = nominationId;
    }

    public String getNomineeName() {
        return nomineeName;
    }

    public void setNomineeName(String nomineeName) {
        this.nomineeName = nomineeName;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public Long getReviewedById() {
        return reviewedById;
    }

    public void setReviewedById(Long reviewedById) {
        this.reviewedById = reviewedById;
    }

    public String getReviewedByName() {
        return reviewedByName;
    }

    public void setReviewedByName(String reviewedByName) {
        this.reviewedByName = reviewedByName;
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

    public LocalDateTime getDecidedAt() {
        return decidedAt;
    }

    public void setDecidedAt(LocalDateTime decidedAt) {
        this.decidedAt = decidedAt;
    }
}
