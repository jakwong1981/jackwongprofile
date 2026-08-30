// backend/src/main/java/com/jackwong/profile/repository/ProfileRepository.java
package com.jackwong.profile.repository;

import com.jackwong.profile.domain.entity.Profile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Persistence gateway for the {@link Profile} aggregate root.
 */
@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findBySlug(String slug);

    Optional<Profile> findFirstByOrderByIdAsc();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
