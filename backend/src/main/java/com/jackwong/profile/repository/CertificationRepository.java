// backend/src/main/java/com/jackwong/profile/repository/CertificationRepository.java
package com.jackwong.profile.repository;

import com.jackwong.profile.domain.entity.Certification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Persistence gateway for professional credentials.
 */
@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {

    List<Certification> findByProfileIdOrderByDisplayOrderAscIssueDateDesc(Long profileId);

    Optional<Certification> findByIdAndProfileId(Long id, Long profileId);

    @Query("select coalesce(max(c.displayOrder), -1) from Certification c where c.profile.id = :profileId")
    int findMaxDisplayOrder(@Param("profileId") Long profileId);
}
