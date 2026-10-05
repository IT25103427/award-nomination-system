package com.awardsystem.nomination;

import com.awardsystem.auth.User;
import com.awardsystem.category.AwardCategory;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nominations")
public class Nomination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", nullable = false, unique = true, length = 50)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nominator_id", nullable = false)
    private User nominator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private AwardCategory category;

    @Column(name = "nominee_name", nullable = false, length = 150)
    private String nomineeName;

    @Column(name = "nominee_email", nullable = false, length = 100)
    private String nomineeEmail;

    @Column(name = "nominee_phone", length = 20)
    private String nomineePhone;

    @Column(name = "nominee_org", length = 150)
    private String nomineeOrg;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String justification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NominationStatus status = NominationStatus.PENDING;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "nomination", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SupportingDocument> documents = new ArrayList<>();

    public Nomination() {
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public User getNominator() {
        return nominator;
    }

    public void setNominator(User nominator) {
        this.nominator = nominator;
    }

    public AwardCategory getCategory() {
        return category;
    }

    public void setCategory(AwardCategory category) {
        this.category = category;
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

    public List<SupportingDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(List<SupportingDocument> documents) {
        this.documents = documents;
    }
}
