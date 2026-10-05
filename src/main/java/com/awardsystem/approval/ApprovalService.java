package com.awardsystem.approval;

import com.awardsystem.auth.User;
import com.awardsystem.approval.dto.ReviewRequest;
import com.awardsystem.approval.dto.ReviewResponse;
import com.awardsystem.common.AppException;
import com.awardsystem.nomination.Nomination;
import com.awardsystem.nomination.NominationRepository;
import com.awardsystem.nomination.NominationStatus;
import com.awardsystem.nomination.dto.NominationResponse;
import com.awardsystem.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApprovalService {

    private final NominationRepository nominationRepository;
    private final NominationReviewRepository reviewRepository;
    private final NotificationService notificationService;

    public ApprovalService(NominationRepository nominationRepository,
                           NominationReviewRepository reviewRepository,
                           NotificationService notificationService) {
        this.nominationRepository = nominationRepository;
        this.reviewRepository = reviewRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<NominationResponse> getReviewQueue(Long categoryId, NominationStatus status, String query) {
        List<Nomination> list = nominationRepository.filterNominations(categoryId, status, (query != null && !query.trim().isEmpty()) ? query.trim() : null);

        return list.stream()
                .map(nom -> {
                    NominationResponse dto = NominationResponse.fromEntity(nom);
                    List<NominationReview> reviews = reviewRepository.findByNominationIdOrderByDecidedAtDesc(nom.getId());
                    if (!reviews.isEmpty()) {
                        dto.setLatestReviewComments(reviews.get(0).getComments());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse reviewNomination(ReviewRequest request, User reviewer) {
        Nomination nomination = nominationRepository.findById(request.getNominationId())
                .orElseThrow(() -> new AppException("Nomination not found with id: " + request.getNominationId(), HttpStatus.NOT_FOUND));

        if (nomination.getStatus() == NominationStatus.WITHDRAWN) {
            throw new AppException("Cannot review a nomination that has already been withdrawn by the nominator", HttpStatus.BAD_REQUEST);
        }

        // 1. Create a new audit trail row in nomination_reviews
        NominationReview review = new NominationReview();
        review.setNomination(nomination);
        review.setReviewedBy(reviewer);
        review.setDecision(request.getDecision());
        review.setComments(request.getComments() != null ? request.getComments().trim() : null);
        NominationReview savedReview = reviewRepository.save(review);

        // 2. Update nominations.status to match the latest decision for fast querying
        NominationStatus newStatus = (request.getDecision() == ReviewDecision.APPROVED)
                ? NominationStatus.APPROVED
                : NominationStatus.REJECTED;
        nomination.setStatus(newStatus);
        nominationRepository.save(nomination);

        // 3. Auto-send email/system notification to the nominator
        String decisionText = (newStatus == NominationStatus.APPROVED) ? "APPROVED" : "REJECTED";
        String commentNotice = (request.getComments() != null && !request.getComments().trim().isEmpty())
                ? " Comments: " + request.getComments().trim()
                : "";

        notificationService.createSystemNotification(
                nomination.getNominator(),
                nomination.getNominator().getEmail(),
                "NOMINATION_" + decisionText,
                "Your nomination " + nomination.getReferenceNumber() + " for " + nomination.getNomineeName() +
                        " (" + nomination.getCategory().getName() + ") has been " + decisionText.toLowerCase() +
                        " by " + reviewer.getFullName() + "." + commentNotice,
                nomination.getId()
        );

        return ReviewResponse.fromEntity(savedReview);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForNomination(Long nominationId) {
        return reviewRepository.findByNominationIdOrderByDecidedAtDesc(nominationId)
                .stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
