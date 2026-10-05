package com.awardsystem.voting;

import com.awardsystem.auth.User;
import com.awardsystem.category.AwardCategory;
import com.awardsystem.nomination.Nomination;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "votes",
       uniqueConstraints = {
           @UniqueConstraint(name = "uq_voter_category", columnNames = {"voter_id", "category_id"})
       })
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voter_id", nullable = false)
    private User voter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nomination_id", nullable = false)
    private Nomination nomination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private AwardCategory category;

    @Column(name = "cast_at", nullable = false, updatable = false)
    private LocalDateTime castAt = LocalDateTime.now();

    public Vote() {
    }

    public Vote(User voter, Nomination nomination, AwardCategory category) {
        this.voter = voter;
        this.nomination = nomination;
        this.category = category;
        this.castAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getVoter() {
        return voter;
    }

    public void setVoter(User voter) {
        this.voter = voter;
    }

    public Nomination getNomination() {
        return nomination;
    }

    public void setNomination(Nomination nomination) {
        this.nomination = nomination;
    }

    public AwardCategory getCategory() {
        return category;
    }

    public void setCategory(AwardCategory category) {
        this.category = category;
    }

    public LocalDateTime getCastAt() {
        return castAt;
    }

    public void setCastAt(LocalDateTime castAt) {
        this.castAt = castAt;
    }
}
