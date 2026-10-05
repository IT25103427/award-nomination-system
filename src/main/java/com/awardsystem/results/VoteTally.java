package com.awardsystem.results;

import com.awardsystem.nomination.Nomination;
import jakarta.persistence.*;

@Entity
@Table(name = "vote_tallies")
public class VoteTally {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "results_id", nullable = false)
    private Result result;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nomination_id", nullable = false)
    private Nomination nomination;

    @Column(name = "vote_count", nullable = false)
    private int voteCount = 0;

    public VoteTally() {
    }

    public VoteTally(Result result, Nomination nomination, int voteCount) {
        this.result = result;
        this.nomination = nomination;
        this.voteCount = voteCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Result getResult() {
        return result;
    }

    public void setResult(Result result) {
        this.result = result;
    }

    public Nomination getNomination() {
        return nomination;
    }

    public void setNomination(Nomination nomination) {
        this.nomination = nomination;
    }

    public int getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(int voteCount) {
        this.voteCount = voteCount;
    }
}
