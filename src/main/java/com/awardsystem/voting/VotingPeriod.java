package com.awardsystem.voting;

import com.awardsystem.auth.User;
import com.awardsystem.category.AwardCategory;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "voting_periods")
public class VotingPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private AwardCategory category;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PeriodStatus status = PeriodStatus.SCHEDULED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_by", nullable = false)
    private User setBy;

    public VotingPeriod() {
    }

    public VotingPeriod(AwardCategory category, LocalDateTime startDate, LocalDateTime endDate, PeriodStatus status, User setBy) {
        this.category = category;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.setBy = setBy;
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

    public User getSetBy() {
        return setBy;
    }

    public void setSetBy(User setBy) {
        this.setBy = setBy;
    }
}
