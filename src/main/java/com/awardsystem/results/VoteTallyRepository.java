package com.awardsystem.results;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteTallyRepository extends JpaRepository<VoteTally, Long> {
    List<VoteTally> findByResultIdOrderByVoteCountDesc(Long resultId);
    void deleteByResultId(Long resultId);
}
