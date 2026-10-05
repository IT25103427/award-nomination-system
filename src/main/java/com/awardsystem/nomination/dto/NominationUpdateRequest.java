package com.awardsystem.nomination.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class NominationUpdateRequest {

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Nominee full name is required")
    @Size(min = 2, max = 150)
    private String nomineeName;

    @NotBlank(message = "Nominee email is required")
    @Email
    private String nomineeEmail;

    private String nomineePhone;

    private String nomineeOrg;

    @NotBlank(message = "Justification statement is required")
    @Size(min = 20)
    private String justification;

    public NominationUpdateRequest() {
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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
}
