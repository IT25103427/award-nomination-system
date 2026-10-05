package com.awardsystem.voting.dto;

import com.awardsystem.nomination.dto.SupportingDocumentDto;

import java.util.List;

public class BallotNomineeDto {
    private Long nominationId;
    private String nomineeName;
    private String nomineeOrg;
    private String justification;
    private List<SupportingDocumentDto> documents;

    public BallotNomineeDto() {
    }

    public BallotNomineeDto(Long nominationId, String nomineeName, String nomineeOrg, String justification, List<SupportingDocumentDto> documents) {
        this.nominationId = nominationId;
        this.nomineeName = nomineeName;
        this.nomineeOrg = nomineeOrg;
        this.justification = justification;
        this.documents = documents;
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

    public String getJustification() {
        return justification;
    }

    public void setJustification(String justification) {
        this.justification = justification;
    }

    public List<SupportingDocumentDto> getDocuments() {
        return documents;
    }

    public void setDocuments(List<SupportingDocumentDto> documents) {
        this.documents = documents;
    }
}
