package com.awardsystem.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<AwardCategory, Long> {
    List<AwardCategory> findByIsActiveTrue();
    boolean existsByNameIgnoreCase(String name);
}
