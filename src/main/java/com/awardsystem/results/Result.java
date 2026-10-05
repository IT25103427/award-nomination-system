package com.awardsystem.results;

import com.awardsystem.auth.User;
import com.awardsystem.category.AwardCategory;
import com.awardsystem.nomination.Nomination;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "results")
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private AwardCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_nomination_id")
    private Nomination winnerNomination;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "escalation_notes", columnDefinition = "TEXT")
    private String escalationNotes;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @OneToMany(mappedBy = "result", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VoteTally> tallies = new ArrayList<>();

    public Result() {
    }

    public Result(AwardCategory category) {
        this.category = category;
        this.verificationStatus = VerificationStatus.PENDING;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AwardCategory getCategory() {
        return category;
    }

    public void setCategory(AwardCategory category) {
        this.category = category;
    }

    public Nomination getWinnerNomination() {
        return winnerNomination;
    }

    public void setWinnerNomination(Nomination winnerNomination) {
        this.winnerNomination = winnerNomination;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public User getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(User verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getEscalationNotes() {
        return escalationNotes;
    }

    public void setEscalationNotes(String escalationNotes) {
        this.escalationNotes = escalationNotes;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public List<VoteTally> getTallies() {
        return tallies;
    }

    public void setTallies(List<VoteTally> tallies) {
        this.tallies = tallies;
    }
}
