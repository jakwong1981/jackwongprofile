// backend/src/main/java/com/jackwong/profile/repository/NewsIngestionRunRepository.java
package com.jackwong.profile.repository;

import com.jackwong.profile.domain.entity.NewsIngestionRun;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Persistence gateway for news aggregation run audit records.
 */
@Repository
public interface NewsIngestionRunRepository extends JpaRepository<NewsIngestionRun, Long> {

    Optional<NewsIngestionRun> findFirstByOrderByStartedAtDesc();

    List<NewsIngestionRun> findByOrderByStartedAtDesc(Limit limit);
}
