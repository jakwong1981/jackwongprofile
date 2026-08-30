// backend/src/main/java/com/jackwong/profile/repository/ExperienceRepository.java
package com.jackwong.profile.repository;

import com.jackwong.profile.domain.entity.Experience;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Persistence gateway for employer level work experience.
 */
@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {

    List<Experience> findByProfileIdOrderByDisplayOrderAscStartDateDesc(Long profileId);

    Optional<Experience> findByIdAndProfileId(Long id, Long profileId);

    @Query("select coalesce(max(e.displayOrder), -1) from Experience e where e.profile.id = :profileId")
    int findMaxDisplayOrder(@Param("profileId") Long profileId);
}
