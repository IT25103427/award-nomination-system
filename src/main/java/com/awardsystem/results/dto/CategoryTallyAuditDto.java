package com.awardsystem.results.dto;

import com.awardsystem.results.VerificationStatus;

import java.time.LocalDateTime;
import java.util.List;

public class CategoryTallyAuditDto {
    private Long categoryId;
    private String categoryName;
    private boolean votingClosed;
    private long totalRawVotes;
    private int totalTalliedVotes;
    private boolean overallDiscrepancyFound;
    private VerificationStatus verificationStatus;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private String escalationNotes;
    private boolean published;
    private LocalDateTime publishedAt;
    private Long winnerNominationId;
    private String winnerNomineeName;
    private List<CandidateTallyDto> candidates;

    public CategoryTallyAuditDto() {
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

    public boolean isVotingClosed() {
        return votingClosed;
    }

    public void setVotingClosed(boolean votingClosed) {
        this.votingClosed = votingClosed;
    }

    public long getTotalRawVotes() {
        return totalRawVotes;
    }

    public void setTotalRawVotes(long totalRawVotes) {
        this.totalRawVotes = totalRawVotes;
    }

    public int getTotalTalliedVotes() {
        return totalTalliedVotes;
    }

    public void setTotalTalliedVotes(int totalTalliedVotes) {
        this.totalTalliedVotes = totalTalliedVotes;
    }

    public boolean isOverallDiscrepancyFound() {
        return overallDiscrepancyFound;
    }

    public void setOverallDiscrepancyFound(boolean overallDiscrepancyFound) {
        this.overallDiscrepancyFound = overallDiscrepancyFound;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getVerifiedByName() {
        return verifiedByName;
    }

    public void setVerifiedByName(String verifiedByName) {
        this.verifiedByName = verifiedByName;
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

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public Long getWinnerNominationId() {
        return winnerNominationId;
    }

    public void setWinnerNominationId(Long winnerNominationId) {
        this.winnerNominationId = winnerNominationId;
    }

    public String getWinnerNomineeName() {
        return winnerNomineeName;
    }

    public void setWinnerNomineeName(String winnerNomineeName) {
        this.winnerNomineeName = winnerNomineeName;
    }

    public List<CandidateTallyDto> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<CandidateTallyDto> candidates) {
        this.candidates = candidates;
    }
}
