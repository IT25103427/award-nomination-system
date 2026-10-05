package com.awardsystem.approval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NominationReviewRepository extends JpaRepository<NominationReview, Long> {
    List<NominationReview> findByNominationIdOrderByDecidedAtDesc(Long nominationId);
    List<NominationReview> findByReviewedByIdOrderByDecidedAtDesc(Long reviewedById);
}
