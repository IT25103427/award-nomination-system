package com.awardsystem.results.dto;

public class AwardStatisticsDto {
    private long totalUsers;
    private long totalNominations;
    private long pendingNominations;
    private long approvedNominations;
    private long rejectedNominations;
    private long withdrawnNominations;
    private long totalVotesCast;
    private long totalCategories;
    private long openVotingPeriods;
    private long verifiedResults;
    private long publishedWinners;

    public AwardStatisticsDto() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalNominations() {
        return totalNominations;
    }

    public void setTotalNominations(long totalNominations) {
        this.totalNominations = totalNominations;
    }

    public long getPendingNominations() {
        return pendingNominations;
    }

    public void setPendingNominations(long pendingNominations) {
        this.pendingNominations = pendingNominations;
    }

    public long getApprovedNominations() {
        return approvedNominations;
    }

    public void setApprovedNominations(long approvedNominations) {
        this.approvedNominations = approvedNominations;
    }

    public long getRejectedNominations() {
        return rejectedNominations;
    }

    public void setRejectedNominations(long rejectedNominations) {
        this.rejectedNominations = rejectedNominations;
    }

    public long getWithdrawnNominations() {
        return withdrawnNominations;
    }

    public void setWithdrawnNominations(long withdrawnNominations) {
        this.withdrawnNominations = withdrawnNominations;
    }

    public long getTotalVotesCast() {
        return totalVotesCast;
    }

    public void setTotalVotesCast(long totalVotesCast) {
        this.totalVotesCast = totalVotesCast;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getOpenVotingPeriods() {
        return openVotingPeriods;
    }

    public void setOpenVotingPeriods(long openVotingPeriods) {
        this.openVotingPeriods = openVotingPeriods;
    }

    public long getVerifiedResults() {
        return verifiedResults;
    }

    public void setVerifiedResults(long verifiedResults) {
        this.verifiedResults = verifiedResults;
    }

    public long getPublishedWinners() {
        return publishedWinners;
    }

    public void setPublishedWinners(long publishedWinners) {
        this.publishedWinners = publishedWinners;
    }
}
