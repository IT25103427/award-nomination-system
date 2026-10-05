package com.awardsystem.nomination;

import com.awardsystem.auth.Role;
import com.awardsystem.auth.User;
import com.awardsystem.category.AwardCategory;
import com.awardsystem.category.CategoryRepository;
import com.awardsystem.common.AppException;
import com.awardsystem.nomination.dto.*;
import com.awardsystem.notification.NotificationService;
import com.awardsystem.results.ResultRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NominationService {

    private final NominationRepository nominationRepository;
    private final CategoryRepository categoryRepository;
    private final SupportingDocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final ResultRepository resultRepository;

    private final SecureRandom random = new SecureRandom();

    public NominationService(NominationRepository nominationRepository,
                             CategoryRepository categoryRepository,
                             SupportingDocumentRepository documentRepository,
                             FileStorageService fileStorageService,
                             NotificationService notificationService,
                             ResultRepository resultRepository) {
        this.nominationRepository = nominationRepository;
        this.categoryRepository = categoryRepository;
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
        this.resultRepository = resultRepository;
    }

    @Transactional
    public NominationResponse submitNomination(NominationSubmitRequest request, List<MultipartFile> files, User nominator) {
        AwardCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException("Award category not found", HttpStatus.NOT_FOUND));

        if (!category.isActive()) {
            throw new AppException("The selected award category is currently inactive", HttpStatus.BAD_REQUEST);
        }

        Nomination nomination = new Nomination();
        nomination.setReferenceNumber(generateReferenceNumber());
        nomination.setNominator(nominator);
        nomination.setCategory(category);
        nomination.setNomineeName(request.getNomineeName().trim());
        nomination.setNomineeEmail(request.getNomineeEmail().trim().toLowerCase());
        nomination.setNomineePhone(request.getNomineePhone());
        nomination.setNomineeOrg(request.getNomineeOrg());
        nomination.setJustification(request.getJustification().trim());
        nomination.setStatus(NominationStatus.PENDING);

        Nomination saved = nominationRepository.save(nomination);

        // Process supporting documents if provided
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    String storedPath = fileStorageService.storeFile(file);
                    SupportingDocument doc = new SupportingDocument(
                            saved,
                            file.getOriginalFilename(),
                            storedPath,
                            file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                            file.getSize()
                    );
                    documentRepository.save(doc);
                    saved.getDocuments().add(doc);
                }
            }
        }

        // Send confirmation notification to nominator
        notificationService.createSystemNotification(
                nominator,
                nominator.getEmail(),
                "NOMINATION_SUBMITTED",
                "Your nomination for " + saved.getNomineeName() + " (" + category.getName() +
                        ") was successfully submitted. Tracking Reference: " + saved.getReferenceNumber(),
                saved.getId()
        );

        // Also create an external notification record for the nominee (who has no account)
        notificationService.createSystemNotification(
                null,
                saved.getNomineeEmail(),
                "NOMINEE_NOTIFICATION",
                "You have been nominated for '" + category.getName() + "'. You can track nomination status using Reference: " + saved.getReferenceNumber(),
                saved.getId()
        );

        return NominationResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<NominationResponse> getMyNominations(User nominator) {
        return nominationRepository.findByNominatorIdOrderBySubmittedAtDesc(nominator.getId())
                .stream()
                .map(NominationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NominationResponse getNominationById(Long id) {
        Nomination nomination = nominationRepository.findById(id)
                .orElseThrow(() -> new AppException("Nomination not found with id: " + id, HttpStatus.NOT_FOUND));
        return NominationResponse.fromEntity(nomination);
    }

    @Transactional
    public NominationResponse updateNomination(Long id, NominationUpdateRequest request, User currentUser) {
        Nomination nomination = nominationRepository.findById(id)
                .orElseThrow(() -> new AppException("Nomination not found with id: " + id, HttpStatus.NOT_FOUND));

        // Check ownership or admin role
        if (!nomination.getNominator().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new AppException("You are not authorized to edit this nomination", HttpStatus.FORBIDDEN);
        }

        // Can only edit if still Pending Review
        if (nomination.getStatus() != NominationStatus.PENDING) {
            throw new AppException("Cannot edit nomination: It has already been " + nomination.getStatus().name().toLowerCase(), HttpStatus.BAD_REQUEST);
        }

        AwardCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException("Award category not found", HttpStatus.NOT_FOUND));

        nomination.setCategory(category);
        nomination.setNomineeName(request.getNomineeName().trim());
        nomination.setNomineeEmail(request.getNomineeEmail().trim().toLowerCase());
        nomination.setNomineePhone(request.getNomineePhone());
        nomination.setNomineeOrg(request.getNomineeOrg());
        nomination.setJustification(request.getJustification().trim());

        Nomination updated = nominationRepository.save(nomination);
        return NominationResponse.fromEntity(updated);
    }

    @Transactional
    public NominationResponse withdrawNomination(Long id, User currentUser) {
        Nomination nomination = nominationRepository.findById(id)
                .orElseThrow(() -> new AppException("Nomination not found with id: " + id, HttpStatus.NOT_FOUND));

        if (!nomination.getNominator().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new AppException("You are not authorized to withdraw this nomination", HttpStatus.FORBIDDEN);
        }

        if (nomination.getStatus() == NominationStatus.WITHDRAWN) {
            throw new AppException("Nomination has already been withdrawn", HttpStatus.BAD_REQUEST);
        }

        if (nomination.getStatus() != NominationStatus.PENDING && currentUser.getRole() != Role.ADMIN) {
            throw new AppException("Cannot withdraw nomination: It has already been reviewed (" + nomination.getStatus() + ")", HttpStatus.BAD_REQUEST);
        }

        nomination.setStatus(NominationStatus.WITHDRAWN);
        Nomination saved = nominationRepository.save(nomination);

        notificationService.createSystemNotification(
                nomination.getNominator(),
                nomination.getNominator().getEmail(),
                "NOMINATION_WITHDRAWN",
                "Your nomination " + saved.getReferenceNumber() + " for " + saved.getNomineeName() + " has been withdrawn.",
                saved.getId()
        );

        return NominationResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteInvalidNomination(Long id) {
        Nomination nomination = nominationRepository.findById(id)
                .orElseThrow(() -> new AppException("Nomination not found with id: " + id, HttpStatus.NOT_FOUND));
        nominationRepository.delete(nomination);
    }

    @Transactional(readOnly = true)
    public PublicStatusLookupDto lookupPublicStatus(String referenceNumber) {
        String cleanRef = referenceNumber.trim().toUpperCase();
        Nomination nomination = nominationRepository.findByReferenceNumber(cleanRef)
                .orElseThrow(() -> new AppException("No nomination found with reference number: " + cleanRef, HttpStatus.NOT_FOUND));

        PublicStatusLookupDto dto = new PublicStatusLookupDto();
        dto.setReferenceNumber(nomination.getReferenceNumber());
        dto.setNomineeName(nomination.getNomineeName());
        dto.setCategoryName(nomination.getCategory().getName());
        dto.setStatus(nomination.getStatus());
        dto.setSubmittedAt(nomination.getSubmittedAt());

        // Determine stage & description
        boolean isWinner = resultRepository.existsByWinnerNominationIdAndPublishedAtIsNotNull(nomination.getId());
        dto.setWinner(isWinner);

        if (isWinner) {
            dto.setCurrentStage(5);
            dto.setStatusDescription("Congratulations! " + nomination.getNomineeName() + " has been officially announced as the Winner for " + nomination.getCategory().getName() + "!");
        } else if (nomination.getStatus() == NominationStatus.WITHDRAWN) {
            dto.setCurrentStage(1);
            dto.setStatusDescription("This nomination was withdrawn by the nominator.");
        } else if (nomination.getStatus() == NominationStatus.REJECTED) {
            dto.setCurrentStage(2);
            dto.setStatusDescription("The nomination was reviewed by the Award Committee and not approved for the final voting round.");
        } else if (nomination.getStatus() == NominationStatus.APPROVED) {
            dto.setCurrentStage(3);
            dto.setStatusDescription("Approved by the Award Committee! Nominee is advancing in the official voting phase.");
        } else {
            dto.setCurrentStage(1);
            dto.setStatusDescription("Submission received. Awaiting review by the Award Committee.");
        }

        return dto;
    }

    private String generateReferenceNumber() {
        String ref;
        do {
            int number = 1000 + random.nextInt(9000);
            ref = "NOM-2026-" + number;
        } while (nominationRepository.findByReferenceNumber(ref).isPresent());
        return ref;
    }
}
