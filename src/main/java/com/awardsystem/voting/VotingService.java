package com.awardsystem.voting;

import com.awardsystem.auth.User;
import com.awardsystem.category.AwardCategory;
import com.awardsystem.category.CategoryRepository;
import com.awardsystem.common.AppException;
import com.awardsystem.nomination.Nomination;
import com.awardsystem.nomination.NominationRepository;
import com.awardsystem.nomination.NominationStatus;
import com.awardsystem.nomination.dto.SupportingDocumentDto;
import com.awardsystem.notification.NotificationService;
import com.awardsystem.voting.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VotingService {

    private final VoteRepository voteRepository;
    private final VotingPeriodRepository votingPeriodRepository;
    private final CategoryRepository categoryRepository;
    private final NominationRepository nominationRepository;
    private final NotificationService notificationService;

    public VotingService(VoteRepository voteRepository,
                         VotingPeriodRepository votingPeriodRepository,
                         CategoryRepository categoryRepository,
                         NominationRepository nominationRepository,
                         NotificationService notificationService) {
        this.voteRepository = voteRepository;
        this.votingPeriodRepository = votingPeriodRepository;
        this.categoryRepository = categoryRepository;
        this.nominationRepository = nominationRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<BallotCategoryDto> getBallot(User voter) {
        List<AwardCategory> activeCategories = categoryRepository.findByIsActiveTrue();
        List<BallotCategoryDto> ballot = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (AwardCategory category : activeCategories) {
            BallotCategoryDto catDto = new BallotCategoryDto();
            catDto.setCategoryId(category.getId());
            catDto.setCategoryName(category.getName());
            catDto.setCategoryDescription(category.getDescription());
            catDto.setEligibilityCriteria(category.getEligibilityCriteria());

            // Check if voting is open
            boolean isOpen = isVotingActive(category.getId(), now);
            catDto.setVotingOpen(isOpen);

            // Check if voter already cast ballot for this category
            if (voter != null) {
                Optional<Vote> existingVote = voteRepository.findByVoterIdAndCategoryId(voter.getId(), category.getId());
                if (existingVote.isPresent()) {
                    catDto.setHasVoted(true);
                    catDto.setVotedNominationId(existingVote.get().getNomination().getId());
                    catDto.setVotedNomineeName(existingVote.get().getNomination().getNomineeName());
                } else {
                    catDto.setHasVoted(false);
                }
            }

            // Only fetch APPROVED nominees for the voting ballot
            List<Nomination> approvedNominations = nominationRepository.findByCategoryIdAndStatus(category.getId(), NominationStatus.APPROVED);
            List<BallotNomineeDto> nomineeDtos = approvedNominations.stream().map(nom -> {
                List<SupportingDocumentDto> docs = nom.getDocuments() != null
                        ? nom.getDocuments().stream().map(SupportingDocumentDto::fromEntity).collect(Collectors.toList())
                        : List.of();
                return new BallotNomineeDto(
                        nom.getId(),
                        nom.getNomineeName(),
                        nom.getNomineeOrg(),
                        nom.getJustification(),
                        docs
                );
            }).collect(Collectors.toList());

            catDto.setNominees(nomineeDtos);
            ballot.add(catDto);
        }

        return ballot;
    }

    @Transactional
    public void castVote(VoteCastRequest request, User voter) {
        AwardCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException("Award category not found", HttpStatus.NOT_FOUND));

        Nomination nomination = nominationRepository.findById(request.getNominationId())
                .orElseThrow(() -> new AppException("Nomination not found", HttpStatus.NOT_FOUND));

        if (!nomination.getCategory().getId().equals(category.getId())) {
            throw new AppException("Nomination does not belong to the specified category", HttpStatus.BAD_REQUEST);
        }

        if (nomination.getStatus() != NominationStatus.APPROVED) {
            throw new AppException("Votes can only be cast for APPROVED nominees", HttpStatus.BAD_REQUEST);
        }

        // Validate voting period
        if (!isVotingActive(category.getId(), LocalDateTime.now())) {
            throw new AppException("Voting is currently closed for category: " + category.getName(), HttpStatus.BAD_REQUEST);
        }

        // CRITICAL CHECK: Enforce one vote per category per voter in application logic
        if (voteRepository.existsByVoterIdAndCategoryId(voter.getId(), category.getId())) {
            throw new AppException("You have already cast a vote for '" + category.getName() + "'. Exactly one vote per category is allowed.", HttpStatus.CONFLICT);
        }

        // Create and persist vote (database unique constraint uq_voter_category also guarantees consistency under concurrency)
        Vote vote = new Vote(voter, nomination, category);
        voteRepository.save(vote);

        // Send confirmation notification to voter
        notificationService.createSystemNotification(
                voter,
                voter.getEmail(),
                "VOTE_CAST_CONFIRMATION",
                "Your ballot for '" + category.getName() + "' (Nominee: " + nomination.getNomineeName() + ") was securely recorded.",
                vote.getId()
        );
    }

    @Transactional(readOnly = true)
    public List<VoterStatusResponse> getMyVotes(User voter) {
        List<Vote> votes = voteRepository.findByVoterIdOrderByCastAtDesc(voter.getId());
        return votes.stream().map(v -> new VoterStatusResponse(
                v.getCategory().getId(),
                v.getCategory().getName(),
                v.getNomination().getId(),
                v.getNomination().getNomineeName(),
                v.getCastAt()
        )).collect(Collectors.toList());
    }

    public boolean isVotingActive(Long categoryId, LocalDateTime time) {
        List<VotingPeriod> activePeriods = votingPeriodRepository.findActiveVotingPeriodsForCategory(categoryId, time);
        return !activePeriods.isEmpty();
    }

    // Voting Periods Admin / Manager methods
    @Transactional(readOnly = true)
    public List<VotingPeriodResponse> getAllVotingPeriods() {
        return votingPeriodRepository.findAll().stream()
                .map(VotingPeriodResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public VotingPeriodResponse createVotingPeriod(VotingPeriodRequest request, User manager) {
        AwardCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException("Category not found", HttpStatus.NOT_FOUND));
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException("End date must be after start date", HttpStatus.BAD_REQUEST);
        }

        VotingPeriod period = new VotingPeriod();
        period.setCategory(category);
        period.setStartDate(request.getStartDate());
        period.setEndDate(request.getEndDate());
        period.setStatus(request.getStatus() != null ? request.getStatus() : PeriodStatus.SCHEDULED);
        period.setSetBy(manager);

        VotingPeriod saved = votingPeriodRepository.save(period);
        return VotingPeriodResponse.fromEntity(saved);
    }

    @Transactional
    public VotingPeriodResponse updateVotingPeriod(Long id, VotingPeriodRequest request) {
        VotingPeriod period = votingPeriodRepository.findById(id)
                .orElseThrow(() -> new AppException("Voting period not found with id: " + id, HttpStatus.NOT_FOUND));

        if (request.getCategoryId() != null) {
            AwardCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException("Category not found", HttpStatus.NOT_FOUND));
            period.setCategory(category);
        } else {
            period.setCategory(null);
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException("End date must be after start date", HttpStatus.BAD_REQUEST);
        }

        period.setStartDate(request.getStartDate());
        period.setEndDate(request.getEndDate());
        if (request.getStatus() != null) {
            period.setStatus(request.getStatus());
        }

        VotingPeriod updated = votingPeriodRepository.save(period);
        return VotingPeriodResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteVotingPeriod(Long id) {
        if (!votingPeriodRepository.existsById(id)) {
            throw new AppException("Voting period not found", HttpStatus.NOT_FOUND);
        }
        votingPeriodRepository.deleteById(id);
    }
}
