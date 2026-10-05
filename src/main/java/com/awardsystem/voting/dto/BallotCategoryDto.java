package com.awardsystem.voting.dto;

import java.util.List;

public class BallotCategoryDto {
    private Long categoryId;
    private String categoryName;
    private String categoryDescription;
    private String eligibilityCriteria;
    private boolean votingOpen;
    private boolean hasVoted;
    private Long votedNominationId;
    private String votedNomineeName;
    private List<BallotNomineeDto> nominees;

    public BallotCategoryDto() {
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

    public String getCategoryDescription() {
        return categoryDescription;
    }

    public void setCategoryDescription(String categoryDescription) {
        this.categoryDescription = categoryDescription;
    }

    public String getEligibilityCriteria() {
        return eligibilityCriteria;
    }

    public void setEligibilityCriteria(String eligibilityCriteria) {
        this.eligibilityCriteria = eligibilityCriteria;
    }

    public boolean isVotingOpen() {
        return votingOpen;
    }

    public void setVotingOpen(boolean votingOpen) {
        this.votingOpen = votingOpen;
    }

    public boolean isHasVoted() {
        return hasVoted;
    }

    public void setHasVoted(boolean hasVoted) {
        this.hasVoted = hasVoted;
    }

    public Long getVotedNominationId() {
        return votedNominationId;
    }

    public void setVotedNominationId(Long votedNominationId) {
        this.votedNominationId = votedNominationId;
    }

    public String getVotedNomineeName() {
        return votedNomineeName;
    }

    public void setVotedNomineeName(String votedNomineeName) {
        this.votedNomineeName = votedNomineeName;
    }

    public List<BallotNomineeDto> getNominees() {
        return nominees;
    }

    public void setNominees(List<BallotNomineeDto> nominees) {
        this.nominees = nominees;
    }
}
