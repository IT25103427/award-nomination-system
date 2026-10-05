package com.awardsystem.approval;

import com.awardsystem.auth.User;
import com.awardsystem.nomination.Nomination;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "nomination_reviews")
public class NominationReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nomination_id", nullable = false)
    private Nomination nomination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by", nullable = false)
    private User reviewedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReviewDecision decision;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "decided_at", nullable = false, updatable = false)
    private LocalDateTime decidedAt = LocalDateTime.now();

    public NominationReview() {
    }

    public NominationReview(Nomination nomination, User reviewedBy, ReviewDecision decision, String comments) {
        this.nomination = nomination;
        this.reviewedBy = reviewedBy;
        this.decision = decision;
        this.comments = comments;
        this.decidedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Nomination getNomination() {
        return nomination;
    }

    public void setNomination(Nomination nomination) {
        this.nomination = nomination;
    }

    public User getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(User reviewedBy) {
        this.reviewedBy = reviewedBy;
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
