package com.awardsystem.voting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByVoterIdAndCategoryId(Long voterId, Long categoryId);

    Optional<Vote> findByVoterIdAndCategoryId(Long voterId, Long categoryId);

    List<Vote> findByVoterIdOrderByCastAtDesc(Long voterId);

    List<Vote> findByCategoryId(Long categoryId);

    List<Vote> findByNominationId(Long nominationId);

    long countByCategoryId(Long categoryId);

    long countByNominationId(Long nominationId);

    @Query("SELECT v.nomination.id as nominationId, COUNT(v) as voteCount " +
           "FROM Vote v WHERE v.category.id = :categoryId " +
           "GROUP BY v.nomination.id ORDER BY voteCount DESC")
    List<Object[]> countVotesByNominationForCategory(@Param("categoryId") Long categoryId);
}
