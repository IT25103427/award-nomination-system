package com.awardsystem.category;

import com.awardsystem.auth.User;
import com.awardsystem.category.dto.CategoryRequest;
import com.awardsystem.category.dto.CategoryResponse;
import com.awardsystem.common.AppException;
import com.awardsystem.approval.NominationReview;
import com.awardsystem.approval.NominationReviewRepository;
import com.awardsystem.nomination.Nomination;
import com.awardsystem.nomination.NominationRepository;
import com.awardsystem.results.Result;
import com.awardsystem.results.ResultRepository;
import com.awardsystem.voting.Vote;
import com.awardsystem.voting.VoteRepository;
import com.awardsystem.voting.VotingPeriod;
import com.awardsystem.voting.VotingPeriodRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final NominationRepository nominationRepository;
    private final NominationReviewRepository nominationReviewRepository;
    private final VoteRepository voteRepository;
    private final VotingPeriodRepository votingPeriodRepository;
    private final ResultRepository resultRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           NominationRepository nominationRepository,
                           NominationReviewRepository nominationReviewRepository,
                           VoteRepository voteRepository,
                           VotingPeriodRepository votingPeriodRepository,
                           ResultRepository resultRepository) {
        this.categoryRepository = categoryRepository;
        this.nominationRepository = nominationRepository;
        this.nominationReviewRepository = nominationReviewRepository;
        this.voteRepository = voteRepository;
        this.votingPeriodRepository = votingPeriodRepository;
        this.resultRepository = resultRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(boolean onlyActive) {
        List<AwardCategory> categories = onlyActive
                ? categoryRepository.findByIsActiveTrue()
                : categoryRepository.findAll();
        return categories.stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        AwardCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Category not found with id: " + id, HttpStatus.NOT_FOUND));
        return CategoryResponse.fromEntity(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, User currentUser) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new AppException("A category with this name already exists", HttpStatus.CONFLICT);
        }

        AwardCategory category = new AwardCategory();
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setEligibilityCriteria(request.getEligibilityCriteria());
        category.setActive(request.isActive());
        category.setCreatedBy(currentUser);

        AwardCategory saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        AwardCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Category not found with id: " + id, HttpStatus.NOT_FOUND));

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setEligibilityCriteria(request.getEligibilityCriteria());
        category.setActive(request.isActive());

        AwardCategory updated = categoryRepository.save(category);
        return CategoryResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        AwardCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Category not found with id: " + id, HttpStatus.NOT_FOUND));

        // 1. Delete associated voting periods for this category
        List<VotingPeriod> votingPeriods = votingPeriodRepository.findAllByCategoryId(id);
        if (!votingPeriods.isEmpty()) {
            votingPeriodRepository.deleteAll(votingPeriods);
        }

        // 2. Delete results and their cascading vote tallies for this category
        resultRepository.findByCategoryId(id).ifPresent(resultRepository::delete);

        // 3. Delete all votes cast in this category
        List<Vote> votes = voteRepository.findByCategoryId(id);
        if (!votes.isEmpty()) {
            voteRepository.deleteAll(votes);
        }

        // 4. Delete all nominations in this category
        List<Nomination> nominations = nominationRepository.findByCategoryId(id);
        for (Nomination nom : nominations) {
            // Delete reviews for this nomination
            List<NominationReview> reviews = nominationReviewRepository.findByNominationIdOrderByDecidedAtDesc(nom.getId());
            if (!reviews.isEmpty()) {
                nominationReviewRepository.deleteAll(reviews);
            }

            // Remove any other vote referencing this nomination
            List<Vote> nomVotes = voteRepository.findByNominationId(nom.getId());
            if (!nomVotes.isEmpty()) {
                voteRepository.deleteAll(nomVotes);
            }

            // Nullify any winner references to this nomination in other results
            List<Result> allResults = resultRepository.findAll();
            for (Result r : allResults) {
                if (r.getWinnerNomination() != null && r.getWinnerNomination().getId().equals(nom.getId())) {
                    r.setWinnerNomination(null);
                    resultRepository.save(r);
                }
            }

            // Delete nomination (supporting documents cascade automatically)
            nominationRepository.delete(nom);
        }

        // 5. Finally, delete the category itself
        categoryRepository.delete(category);
    }
}
