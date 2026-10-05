package com.awardsystem.voting.dto;

import java.time.LocalDateTime;

public class VoterStatusResponse {
    private Long categoryId;
    private String categoryName;
    private Long nominationId;
    private String nomineeName;
    private LocalDateTime castAt;

    public VoterStatusResponse() {
    }

    public VoterStatusResponse(Long categoryId, String categoryName, Long nominationId, String nomineeName, LocalDateTime castAt) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.nominationId = nominationId;
        this.nomineeName = nomineeName;
        this.castAt = castAt;
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

    public LocalDateTime getCastAt() {
        return castAt;
    }

    public void setCastAt(LocalDateTime castAt) {
        this.castAt = castAt;
    }
}
