// backend/src/main/java/com/jackwong/profile/repository/JobPositionRepository.java
package com.jackwong.profile.repository;

import com.jackwong.profile.domain.entity.JobPosition;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Persistence gateway for job titles held under a single employer.
 */
@Repository
public interface JobPositionRepository extends JpaRepository<JobPosition, Long> {

    List<JobPosition> findByExperienceIdOrderByDisplayOrderAscStartDateDesc(Long experienceId);

    Optional<JobPosition> findByIdAndExperienceId(Long id, Long experienceId);
}
