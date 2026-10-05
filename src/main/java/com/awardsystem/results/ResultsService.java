package com.awardsystem.results;

import com.awardsystem.auth.Role;
import com.awardsystem.auth.User;
import com.awardsystem.auth.UserRepository;
import com.awardsystem.category.AwardCategory;
import com.awardsystem.category.CategoryRepository;
import com.awardsystem.common.AppException;
import com.awardsystem.nomination.Nomination;
import com.awardsystem.nomination.NominationRepository;
import com.awardsystem.nomination.NominationStatus;
import com.awardsystem.notification.NotificationService;
import com.awardsystem.results.dto.*;
import com.awardsystem.voting.PeriodStatus;
import com.awardsystem.voting.VoteRepository;
import com.awardsystem.voting.VotingPeriodRepository;
import com.awardsystem.voting.VotingService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResultsService {

    private final ResultRepository resultRepository;
    private final VoteTallyRepository voteTallyRepository;
    private final VoteRepository voteRepository;
    private final CategoryRepository categoryRepository;
    private final NominationRepository nominationRepository;
    private final VotingPeriodRepository votingPeriodRepository;
    private final UserRepository userRepository;
    private final VotingService votingService;
    private final NotificationService notificationService;

    public ResultsService(ResultRepository resultRepository,
                          VoteTallyRepository voteTallyRepository,
                          VoteRepository voteRepository,
                          CategoryRepository categoryRepository,
                          NominationRepository nominationRepository,
                          VotingPeriodRepository votingPeriodRepository,
                          UserRepository userRepository,
                          VotingService votingService,
                          NotificationService notificationService) {
        this.resultRepository = resultRepository;
        this.voteTallyRepository = voteTallyRepository;
        this.voteRepository = voteRepository;
        this.categoryRepository = categoryRepository;
        this.nominationRepository = nominationRepository;
        this.votingPeriodRepository = votingPeriodRepository;
        this.userRepository = userRepository;
        this.votingService = votingService;
        this.notificationService = notificationService;
    }

    @Transactional
    public List<CategoryTallyAuditDto> getAuditableTallies(Long specificCategoryId) {
        List<AwardCategory> categories;
        if (specificCategoryId != null) {
            AwardCategory cat = categoryRepository.findById(specificCategoryId)
                    .orElseThrow(() -> new AppException("Category not found", HttpStatus.NOT_FOUND));
            categories = List.of(cat);
        } else {
            categories = categoryRepository.findByIsActiveTrue();
        }

        List<CategoryTallyAuditDto> dtos = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (AwardCategory category : categories) {
            boolean isVotingOpen = votingService.isVotingActive(category.getId(), now);
            Result result = resultRepository.findByCategoryId(category.getId())
                    .orElseGet(() -> {
                        Result newResult = new Result(category);
                        return resultRepository.save(newResult);
                    });

            // Get all approved nominations for this category
            List<Nomination> approvedNominations = nominationRepository.findByCategoryIdAndStatus(category.getId(), NominationStatus.APPROVED);

            // Fetch raw votes grouped by nomination
            List<Object[]> rawGrouped = voteRepository.countVotesByNominationForCategory(category.getId());
            Map<Long, Long> rawVoteMap = new HashMap<>();
            long totalRawVotes = 0;
            for (Object[] row : rawGrouped) {
                Long nomId = (Long) row[0];
                Long count = (Long) row[1];
                rawVoteMap.put(nomId, count);
                totalRawVotes += count;
            }

            // Sync automated vote tallies in vote_tallies table
            List<VoteTally> existingTallies = voteTallyRepository.findByResultIdOrderByVoteCountDesc(result.getId());
            Map<Long, VoteTally> tallyMap = existingTallies.stream()
                    .collect(Collectors.toMap(t -> t.getNomination().getId(), t -> t));

            for (Nomination nom : approvedNominations) {
                int count = rawVoteMap.getOrDefault(nom.getId(), 0L).intValue();
                VoteTally tally = tallyMap.get(nom.getId());
                if (tally == null) {
                    tally = new VoteTally(result, nom, count);
                    voteTallyRepository.save(tally);
                    existingTallies.add(tally);
                } else if (tally.getVoteCount() != count) {
                    // Update tally to current automated count
                    tally.setVoteCount(count);
                    voteTallyRepository.save(tally);
                }
            }

            // Build Candidate audit items
            boolean anyDiscrepancy = false;
            int totalTallied = 0;
            Nomination topCandidate = null;
            int maxVotes = -1;

            List<CandidateTallyDto> candidateDtos = new ArrayList<>();
            for (Nomination nom : approvedNominations) {
                long rawCount = rawVoteMap.getOrDefault(nom.getId(), 0L);
                VoteTally tally = existingTallies.stream()
                        .filter(t -> t.getNomination().getId().equals(nom.getId()))
                        .findFirst().orElse(null);
                int tallyCount = (tally != null) ? tally.getVoteCount() : 0;
                totalTallied += tallyCount;

                boolean disc = (rawCount != tallyCount);
                if (disc) anyDiscrepancy = true;

                if (tallyCount > maxVotes) {
                    maxVotes = tallyCount;
                    topCandidate = nom;
                }

                candidateDtos.add(new CandidateTallyDto(
                        nom.getId(),
                        nom.getNomineeName(),
                        nom.getNomineeOrg(),
                        nom.getReferenceNumber(),
                        tallyCount,
                        rawCount,
                        disc
                ));
            }

            CategoryTallyAuditDto dto = new CategoryTallyAuditDto();
            dto.setCategoryId(category.getId());
            dto.setCategoryName(category.getName());
            dto.setVotingClosed(!isVotingOpen);
            dto.setTotalRawVotes(totalRawVotes);
            dto.setTotalTalliedVotes(totalTallied);
            dto.setOverallDiscrepancyFound(anyDiscrepancy);
            dto.setVerificationStatus(result.getVerificationStatus());
            dto.setVerifiedByName(result.getVerifiedBy() != null ? result.getVerifiedBy().getFullName() : null);
            dto.setVerifiedAt(result.getVerifiedAt());
            dto.setEscalationNotes(result.getEscalationNotes());
            dto.setPublished(result.getPublishedAt() != null);
            dto.setPublishedAt(result.getPublishedAt());
            if (result.getWinnerNomination() != null) {
                dto.setWinnerNominationId(result.getWinnerNomination().getId());
                dto.setWinnerNomineeName(result.getWinnerNomination().getNomineeName());
            } else if (topCandidate != null && maxVotes > 0) {
                dto.setWinnerNominationId(topCandidate.getId());
                dto.setWinnerNomineeName(topCandidate.getNomineeName());
            }
            dto.setCandidates(candidateDtos);

            dtos.add(dto);
        }

        return dtos;
    }

    @Transactional
    public CategoryTallyAuditDto verifyResults(VerificationSignoffRequest request, User officer) {
        Result result = resultRepository.findByCategoryId(request.getCategoryId())
                .orElseThrow(() -> new AppException("Results record not found for category", HttpStatus.NOT_FOUND));

        // Determine top candidate
        List<VoteTally> tallies = voteTallyRepository.findByResultIdOrderByVoteCountDesc(result.getId());
        if (!tallies.isEmpty()) {
            result.setWinnerNomination(tallies.get(0).getNomination());
        }

        result.setVerificationStatus(VerificationStatus.VERIFIED);
        result.setVerifiedBy(officer);
        result.setVerifiedAt(LocalDateTime.now());
        result.setEscalationNotes(request.getNotes());
        resultRepository.save(result);

        // Notify Program Manager & Admin
        List<User> recipients = userRepository.findByRole(Role.PROGRAM_MANAGER);
        recipients.addAll(userRepository.findByRole(Role.ADMIN));
        for (User u : recipients) {
            notificationService.createSystemNotification(
                    u,
                    u.getEmail(),
                    "RESULTS_VERIFIED",
                    "Results for category '" + result.getCategory().getName() +
                            "' have been audited and signed off as VERIFIED by Officer " + officer.getFullName(),
                    result.getId()
            );
        }

        return getAuditableTallies(request.getCategoryId()).get(0);
    }

    @Transactional
    public CategoryTallyAuditDto escalateDiscrepancy(DiscrepancyEscalationRequest request, User officer) {
        Result result = resultRepository.findByCategoryId(request.getCategoryId())
                .orElseThrow(() -> new AppException("Results record not found for category", HttpStatus.NOT_FOUND));

        result.setVerificationStatus(VerificationStatus.DISCREPANCY);
        result.setVerifiedBy(officer);
        result.setVerifiedAt(LocalDateTime.now());
        result.setEscalationNotes(request.getEscalationNotes().trim());
        resultRepository.save(result);

        // High priority notification to Administrator
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createSystemNotification(
                    admin,
                    admin.getEmail(),
                    "DISCREPANCY_ESCALATION",
                    "ACTION REQUIRED: Verification Officer " + officer.getFullName() +
                            " flagged a discrepancy for category '" + result.getCategory().getName() +
                            "'. Notes: " + request.getEscalationNotes().trim(),
                    result.getId()
            );
        }

        return getAuditableTallies(request.getCategoryId()).get(0);
    }

    @Transactional
    public PublishedWinnerDto publishWinner(PublishWinnerRequest request, User publisher) {
        Result result = resultRepository.findByCategoryId(request.getCategoryId())
                .orElseThrow(() -> new AppException("Results not found for category", HttpStatus.NOT_FOUND));

        // Enforce requirement: Results must be verified before publishing
        if (result.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new AppException("Cannot publish results: Category tallies must be audited and signed off by the Results Verification Officer first (Status is currently " + result.getVerificationStatus() + ")", HttpStatus.BAD_REQUEST);
        }

        if (result.getWinnerNomination() == null) {
            List<VoteTally> tallies = voteTallyRepository.findByResultIdOrderByVoteCountDesc(result.getId());
            if (tallies.isEmpty()) {
                throw new AppException("No candidate tallies available to declare a winner", HttpStatus.BAD_REQUEST);
            }
            result.setWinnerNomination(tallies.get(0).getNomination());
        }

        result.setPublishedAt(LocalDateTime.now());
        resultRepository.save(result);

        Nomination winner = result.getWinnerNomination();
        int winnerVotes = 0;
        List<VoteTally> tallies = voteTallyRepository.findByResultIdOrderByVoteCountDesc(result.getId());
        if (!tallies.isEmpty()) {
            winnerVotes = tallies.get(0).getVoteCount();
        }

        // Send announcement notifications to all users
        notificationService.createSystemNotification(
                null,
                null,
                "WINNERS_ANNOUNCED",
                "Official Winner Announced! " + winner.getNomineeName() + " has won the '" +
                        result.getCategory().getName() + "' award with " + winnerVotes + " verified votes!",
                winner.getId()
        );

        PublishedWinnerDto dto = new PublishedWinnerDto();
        dto.setCategoryId(result.getCategory().getId());
        dto.setCategoryName(result.getCategory().getName());
        dto.setNominationId(winner.getId());
        dto.setNomineeName(winner.getNomineeName());
        dto.setNomineeOrg(winner.getNomineeOrg());
        dto.setReferenceNumber(winner.getReferenceNumber());
        dto.setJustification(winner.getJustification());
        dto.setVoteCount(winnerVotes);
        dto.setPublishedAt(result.getPublishedAt());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<PublishedWinnerDto> getPublishedWinners() {
        List<Result> publishedResults = resultRepository.findByPublishedAtIsNotNull();
        List<PublishedWinnerDto> list = new ArrayList<>();

        for (Result r : publishedResults) {
            if (r.getWinnerNomination() != null) {
                PublishedWinnerDto dto = new PublishedWinnerDto();
                dto.setCategoryId(r.getCategory().getId());
                dto.setCategoryName(r.getCategory().getName());
                dto.setNominationId(r.getWinnerNomination().getId());
                dto.setNomineeName(r.getWinnerNomination().getNomineeName());
                dto.setNomineeOrg(r.getWinnerNomination().getNomineeOrg());
                dto.setReferenceNumber(r.getWinnerNomination().getReferenceNumber());
                dto.setJustification(r.getWinnerNomination().getJustification());
                dto.setPublishedAt(r.getPublishedAt());

                List<VoteTally> tallies = voteTallyRepository.findByResultIdOrderByVoteCountDesc(r.getId());
                dto.setVoteCount(!tallies.isEmpty() ? tallies.get(0).getVoteCount() : 0);

                list.add(dto);
            }
        }

        return list;
    }

    @Transactional(readOnly = true)
    public AwardStatisticsDto getStatistics() {
        AwardStatisticsDto stats = new AwardStatisticsDto();
        stats.setTotalUsers(userRepository.count());
        stats.setTotalNominations(nominationRepository.count());
        stats.setPendingNominations(nominationRepository.countByStatus(NominationStatus.PENDING));
        stats.setApprovedNominations(nominationRepository.countByStatus(NominationStatus.APPROVED));
        stats.setRejectedNominations(nominationRepository.countByStatus(NominationStatus.REJECTED));
        stats.setWithdrawnNominations(nominationRepository.countByStatus(NominationStatus.WITHDRAWN));
        stats.setTotalVotesCast(voteRepository.count());
        stats.setTotalCategories(categoryRepository.count());
        stats.setOpenVotingPeriods(votingPeriodRepository.findByStatus(PeriodStatus.OPEN).size());
        stats.setVerifiedResults(resultRepository.findByVerificationStatus(VerificationStatus.VERIFIED).size());
        stats.setPublishedWinners(resultRepository.findByPublishedAtIsNotNull().size());
        return stats;
    }
}
