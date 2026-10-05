package com.awardsystem.results.dto;

public class CandidateTallyDto {
    private Long nominationId;
    private String nomineeName;
    private String nomineeOrg;
    private String referenceNumber;
    private int automatedTally;
    private long rawVoteCount;
    private boolean discrepancy;

    public CandidateTallyDto() {
    }

    public CandidateTallyDto(Long nominationId, String nomineeName, String nomineeOrg, String referenceNumber, int automatedTally, long rawVoteCount, boolean discrepancy) {
        this.nominationId = nominationId;
        this.nomineeName = nomineeName;
        this.nomineeOrg = nomineeOrg;
        this.referenceNumber = referenceNumber;
        this.automatedTally = automatedTally;
        this.rawVoteCount = rawVoteCount;
        this.discrepancy = discrepancy;
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

    public String getNomineeOrg() {
        return nomineeOrg;
    }

    public void setNomineeOrg(String nomineeOrg) {
        this.nomineeOrg = nomineeOrg;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public int getAutomatedTally() {
        return automatedTally;
    }

    public void setAutomatedTally(int automatedTally) {
        this.automatedTally = automatedTally;
    }

    public long getRawVoteCount() {
        return rawVoteCount;
    }

    public void setRawVoteCount(long rawVoteCount) {
        this.rawVoteCount = rawVoteCount;
    }

    public boolean isDiscrepancy() {
        return discrepancy;
    }

    public void setDiscrepancy(boolean discrepancy) {
        this.discrepancy = discrepancy;
    }
}
