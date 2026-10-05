package com.awardsystem.nomination;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NominationRepository extends JpaRepository<Nomination, Long> {

    Optional<Nomination> findByReferenceNumber(String referenceNumber);

    List<Nomination> findByNominatorIdOrderBySubmittedAtDesc(Long nominatorId);

    List<Nomination> findByCategoryId(Long categoryId);

    List<Nomination> findByCategoryIdAndStatus(Long categoryId, NominationStatus status);

    List<Nomination> findByStatus(NominationStatus status);

    @Query("SELECT n FROM Nomination n WHERE " +
           "(:categoryId IS NULL OR n.category.id = :categoryId) AND " +
           "(:status IS NULL OR n.status = :status) AND " +
           "(:query IS NULL OR LOWER(n.nomineeName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(n.referenceNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Nomination> filterNominations(
            @Param("categoryId") Long categoryId,
            @Param("status") NominationStatus status,
            @Param("query") String query
    );

    long countByStatus(NominationStatus status);

    long countByCategoryId(Long categoryId);
}
