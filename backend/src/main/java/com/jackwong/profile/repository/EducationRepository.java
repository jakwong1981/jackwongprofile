// backend/src/main/java/com/jackwong/profile/repository/EducationRepository.java
package com.jackwong.profile.repository;

import com.jackwong.profile.domain.entity.Education;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Persistence gateway for academic records.
 */
@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {

    List<Education> findByProfileIdOrderByDisplayOrderAscEndDateDesc(Long profileId);

    Optional<Education> findByIdAndProfileId(Long id, Long profileId);

    @Query("select coalesce(max(e.displayOrder), -1) from Education e where e.profile.id = :profileId")
    int findMaxDisplayOrder(@Param("profileId") Long profileId);
}
