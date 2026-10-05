package com.awardsystem.nomination.dto;

import com.awardsystem.nomination.Nomination;
import com.awardsystem.nomination.NominationStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class NominationResponse {
    private Long id;
    private String referenceNumber;
    private Long nominatorId;
    private String nominatorName;
    private String nominatorEmail;
    private Long categoryId;
    private String categoryName;
    private String nomineeName;
    private String nomineeEmail;
    private String nomineePhone;
    private String nomineeOrg;
    private String justification;
    private NominationStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private List<SupportingDocumentDto> documents;
    private String latestReviewComments;

    public NominationResponse() {
    }

    public static NominationResponse fromEntity(Nomination n) {
        NominationResponse dto = new NominationResponse();
        dto.setId(n.getId());
        dto.setReferenceNumber(n.getReferenceNumber());
        if (n.getNominator() != null) {
            dto.setNominatorId(n.getNominator().getId());
            dto.setNominatorName(n.getNominator().getFullName());
            dto.setNominatorEmail(n.getNominator().getEmail());
        }
        if (n.getCategory() != null) {
            dto.setCategoryId(n.getCategory().getId());
            dto.setCategoryName(n.getCategory().getName());
        }
        dto.setNomineeName(n.getNomineeName());
        dto.setNomineeEmail(n.getNomineeEmail());
        dto.setNomineePhone(n.getNomineePhone());
        dto.setNomineeOrg(n.getNomineeOrg());
        dto.setJustification(n.getJustification());
        dto.setStatus(n.getStatus());
        dto.setSubmittedAt(n.getSubmittedAt());
        dto.setUpdatedAt(n.getUpdatedAt());
        if (n.getDocuments() != null) {
            dto.setDocuments(n.getDocuments().stream()
                    .map(SupportingDocumentDto::fromEntity)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public Long getNominatorId() {
        return nominatorId;
    }

    public void setNominatorId(Long nominatorId) {
        this.nominatorId = nominatorId;
    }

    public String getNominatorName() {
        return nominatorName;
    }

    public void setNominatorName(String nominatorName) {
        this.nominatorName = nominatorName;
    }

    public String getNominatorEmail() {
        return nominatorEmail;
    }

    public void setNominatorEmail(String nominatorEmail) {
        this.nominatorEmail = nominatorEmail;
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

    public String getNomineeName() {
        return nomineeName;
    }

    public void setNomineeName(String nomineeName) {
        this.nomineeName = nomineeName;
    }

    public String getNomineeEmail() {
        return nomineeEmail;
    }

    public void setNomineeEmail(String nomineeEmail) {
        this.nomineeEmail = nomineeEmail;
    }

    public String getNomineePhone() {
        return nomineePhone;
    }

    public void setNomineePhone(String nomineePhone) {
        this.nomineePhone = nomineePhone;
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

    public NominationStatus getStatus() {
        return status;
    }

    public void setStatus(NominationStatus status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<SupportingDocumentDto> getDocuments() {
        return documents;
    }

    public void setDocuments(List<SupportingDocumentDto> documents) {
        this.documents = documents;
    }

    public String getLatestReviewComments() {
        return latestReviewComments;
    }

    public void setLatestReviewComments(String latestReviewComments) {
        this.latestReviewComments = latestReviewComments;
    }
}
