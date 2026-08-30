// backend/src/main/java/com/jackwong/profile/repository/NewsArticleRepository.java
package com.jackwong.profile.repository;

import com.jackwong.profile.domain.entity.AnalysisStatus;
import com.jackwong.profile.domain.entity.NewsArticle;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Persistence gateway for aggregated AI news items. Filtering is expressed through
 * type-safe {@link org.springframework.data.jpa.domain.Specification} instances rather than
 * concatenated SQL.
 */
@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long>,
        JpaSpecificationExecutor<NewsArticle> {

    Optional<NewsArticle> findByExternalId(String externalId);

    boolean existsByExternalId(String externalId);

    List<NewsArticle> findByAnalysisStatusOrderByFetchedAtAsc(AnalysisStatus status, Limit limit);

    @Query("select distinct a.category from NewsArticle a where a.category is not null order by a.category asc")
    List<String> findDistinctCategories();
}
