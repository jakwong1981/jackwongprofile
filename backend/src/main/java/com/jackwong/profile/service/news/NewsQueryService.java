// backend/src/main/java/com/jackwong/profile/service/news/NewsQueryService.java
package com.jackwong.profile.service.news;

import com.jackwong.profile.api.dto.response.NewsArticleResponse;
import com.jackwong.profile.api.dto.response.NewsIngestionRunResponse;
import com.jackwong.profile.api.dto.response.NewsStatsResponse;
import com.jackwong.profile.api.mapper.NewsMapper;
import com.jackwong.profile.common.api.PageResponse;
import com.jackwong.profile.common.exception.ResourceNotFoundException;
import com.jackwong.profile.config.NewsProperties;
import com.jackwong.profile.domain.entity.AnalysisStatus;
import com.jackwong.profile.domain.entity.NewsArticle;
import com.jackwong.profile.repository.NewsArticleRepository;
import com.jackwong.profile.repository.NewsIngestionRunRepository;
import com.jackwong.profile.repository.spec.NewsArticleSpecifications;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read side of the news dashboard: paged search plus the header counters.
 */
@Service
@RequiredArgsConstructor
public class NewsQueryService {

    private static final int MAX_PAGE_SIZE = 100;

    private final NewsArticleRepository newsArticleRepository;
    private final NewsIngestionRunRepository newsIngestionRunRepository;
    private final NewsProperties newsProperties;
    private final NewsMapper newsMapper;

    /**
     * Paged, filtered article search ordered by publication date descending.
     *
     * @param sourceKey optional source filter
     * @param category  optional taxonomy filter
     * @param status    optional analysis status filter
     * @param keyword   optional free-text term matched against title, excerpt, and summary
     * @param from      optional lower publication bound
     * @param to        optional upper publication bound
     * @param page      zero based page index
     * @param size      page size, capped at 100
     * @return one page of results
     */
    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public PageResponse<NewsArticleResponse> search(String sourceKey, String category, AnalysisStatus status,
            String keyword, Instant from, Instant to, int page, int size) {
        Specification<NewsArticle> specification = Specification
                .where(NewsArticleSpecifications.sourceKeyEquals(sourceKey))
                .and(NewsArticleSpecifications.categoryEquals(category))
                .and(NewsArticleSpecifications.analysisStatusEquals(status))
                .and(NewsArticleSpecifications.keywordMatches(keyword))
                .and(NewsArticleSpecifications.publishedAfter(from))
                .and(NewsArticleSpecifications.publishedBefore(to));

        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), clampSize(size),
                Sort.by(Sort.Direction.DESC, "publishedAt").and(Sort.by(Sort.Direction.DESC, "id")));
        Page<NewsArticleResponse> result = newsArticleRepository.findAll(specification, pageRequest)
                .map(newsMapper::toResponse);
        return PageResponse.from(result);
    }

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public NewsArticleResponse getById(Long id) {
        return newsArticleRepository.findById(id)
                .map(newsMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("NewsArticle", id));
    }

    /**
     * @return dashboard counters, the configured sources, and the latest aggregation run
     */
    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public NewsStatsResponse stats() {
        long total = newsArticleRepository.count();
        long analyzed = countByStatus(AnalysisStatus.COMPLETED);
        long pending = countByStatus(AnalysisStatus.PENDING);
        long failed = countByStatus(AnalysisStatus.FAILED);

        List<NewsStatsResponse.NewsSourceSummary> sources = newsProperties.safeSources().stream()
                .map(source -> new NewsStatsResponse.NewsSourceSummary(
                        source.key(),
                        source.displayName(),
                        source.siteUrl(),
                        source.enabled(),
                        newsArticleRepository.count(NewsArticleSpecifications.sourceKeyEquals(source.key()))))
                .toList();

        return new NewsStatsResponse(
                total,
                analyzed,
                pending,
                failed,
                newsArticleRepository.findDistinctCategories(),
                sources,
                newsIngestionRunRepository.findFirstByOrderByStartedAtDesc()
                        .map(newsMapper::toRunResponse)
                        .orElse(null));
    }

    private long countByStatus(AnalysisStatus status) {
        return newsArticleRepository.count(NewsArticleSpecifications.analysisStatusEquals(status));
    }

    /**
     * @param limit maximum number of runs to return
     * @return the most recent aggregation runs, newest first
     */
    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public List<NewsIngestionRunResponse> recentRuns(int limit) {
        return newsIngestionRunRepository.findByOrderByStartedAtDesc(Limit.of(clampSize(limit))).stream()
                .map(newsMapper::toRunResponse)
                .toList();
    }

    private int clampSize(int size) {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, MAX_PAGE_SIZE);
    }
}
