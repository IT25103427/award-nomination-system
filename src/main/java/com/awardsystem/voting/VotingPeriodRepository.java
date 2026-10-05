package com.awardsystem.voting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VotingPeriodRepository extends JpaRepository<VotingPeriod, Long> {

    List<VotingPeriod> findByStatus(PeriodStatus status);

    Optional<VotingPeriod> findByCategoryId(Long categoryId);

    List<VotingPeriod> findAllByCategoryId(Long categoryId);

    @Query("SELECT vp FROM VotingPeriod vp WHERE " +
           "(vp.category.id = :categoryId OR vp.category IS NULL) AND " +
           "vp.status = 'OPEN' AND " +
           ":now BETWEEN vp.startDate AND vp.endDate")
    List<VotingPeriod> findActiveVotingPeriodsForCategory(@Param("categoryId") Long categoryId, @Param("now") LocalDateTime now);

    @Query("SELECT vp FROM VotingPeriod vp WHERE vp.category IS NULL")
    Optional<VotingPeriod> findGlobalVotingPeriod();
}
