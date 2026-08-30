// backend/src/main/java/com/jackwong/profile/service/news/NewsPersistenceService.java
package com.jackwong.profile.service.news;

import com.jackwong.profile.common.util.HashUtils;
import com.jackwong.profile.config.NewsProperties;
import com.jackwong.profile.domain.entity.AnalysisStatus;
import com.jackwong.profile.domain.entity.ImpactLevel;
import com.jackwong.profile.domain.entity.IngestionStatus;
import com.jackwong.profile.domain.entity.NewsArticle;
import com.jackwong.profile.domain.entity.NewsIngestionRun;
import com.jackwong.profile.integration.deepseek.ArticleAnalysis;
import com.jackwong.profile.repository.NewsArticleRepository;
import com.jackwong.profile.repository.NewsIngestionRunRepository;
import com.jackwong.profile.service.news.fetcher.FetchedArticle;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Short, self-contained write transactions for the news aggregator. Network I/O stays in
 * {@link NewsIngestionService} so a slow upstream can never hold a database transaction open.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NewsPersistenceService {

    private static final int MAX_ERROR_LENGTH = 500;

    private final NewsArticleRepository newsArticleRepository;
    private final NewsIngestionRunRepository newsIngestionRunRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public NewsIngestionRun startRun(String triggeredBy, int sourceCount) {
        NewsIngestionRun run = new NewsIngestionRun();
        run.setStartedAt(Instant.now());
        run.setStatus(IngestionStatus.RUNNING);
        run.setSourceCount(sourceCount);
        run.setTriggeredBy(triggeredBy);
        return newsIngestionRunRepository.save(run);
    }

    /**
     * Stores the items of one source, skipping anything already known.
     *
     * @param source  originating source configuration
     * @param batch   items read from that source
     * @return ids of the rows actually created
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public List<Long> persistBatch(NewsProperties.Source source, List<FetchedArticle> batch) {
        Instant fetchedAt = Instant.now();
        return batch.stream()
                .map(item -> persistOne(source, item, fetchedAt))
                .flatMap(Optional::stream)
                .toList();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public NewsIngestionRun completeRun(Long runId, IngestionStatus status, int fetched, int created, int analyzed,
            int failed, String message) {
        NewsIngestionRun run = newsIngestionRunRepository.findById(runId)
                .orElseThrow(() -> new IllegalStateException("Ingestion run %d vanished".formatted(runId)));
        run.setFinishedAt(Instant.now());
        run.setStatus(status);
        run.setFetchedCount(fetched);
        run.setCreatedCount(created);
        run.setAnalyzedCount(analyzed);
        run.setFailedCount(failed);
        run.setMessage(message);
        return run;
    }

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public List<NewsArticle> findPending(int limit) {
        return newsArticleRepository.findByAnalysisStatusOrderByFetchedAtAsc(AnalysisStatus.PENDING,
                Limit.of(limit));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void applyAnalysis(Long articleId, ArticleAnalysis analysis) {
        newsArticleRepository.findById(articleId).ifPresent(article -> {
            article.setSummary(analysis.summary());
            article.setKeyPoints(analysis.safeKeyPoints());
            article.setKeywords(analysis.safeKeywords());
            article.setCategory(normalizeCategory(analysis.category()));
            article.setImpactLevel(ImpactLevel.fromRaw(analysis.impactLevel()));
            article.setLanguage(analysis.language());
            article.setAnalysisStatus(AnalysisStatus.COMPLETED);
            article.setAnalysisError(null);
            article.setAnalyzedAt(Instant.now());
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void markAnalysisFailed(Long articleId, String reason) {
        newsArticleRepository.findById(articleId).ifPresent(article -> {
            article.setAnalysisStatus(AnalysisStatus.FAILED);
            article.setAnalysisError(truncate(reason));
            article.setAnalyzedAt(Instant.now());
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void markAnalysisSkipped(List<Long> articleIds) {
        newsArticleRepository.findAllById(articleIds).forEach(article -> {
            article.setAnalysisStatus(AnalysisStatus.SKIPPED);
            article.setAnalysisError("DeepSeek integration is disabled");
        });
    }

    /**
     * Removes one article permanently.
     *
     * @param articleId target article
     * @throws com.jackwong.profile.common.exception.ResourceNotFoundException when it does not exist
     */
    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public void deleteArticle(Long articleId) {
        NewsArticle article = newsArticleRepository.findById(articleId)
                .orElseThrow(() -> new com.jackwong.profile.common.exception.ResourceNotFoundException(
                        "NewsArticle", articleId));
        newsArticleRepository.delete(article);
        log.info("Deleted news article id={}", articleId);
    }

    private Optional<Long> persistOne(NewsProperties.Source source, FetchedArticle item, Instant fetchedAt) {
        String externalId = HashUtils.sha256Hex(item.url());
        if (newsArticleRepository.existsByExternalId(externalId)) {
            return Optional.empty();
        }
        NewsArticle article = new NewsArticle();
        article.setExternalId(externalId);
        article.setSourceKey(source.key());
        article.setSourceName(source.displayName());
        article.setTitle(item.title());
        article.setUrl(item.url());
        article.setAuthor(item.author());
        article.setPublishedAt(item.publishedAt() == null ? fetchedAt : item.publishedAt());
        article.setExcerpt(item.excerpt());
        article.setFetchedAt(fetchedAt);
        article.setAnalysisStatus(AnalysisStatus.PENDING);
        return Optional.of(newsArticleRepository.save(article).getId());
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return "OTHER";
        }
        String upper = category.trim().toUpperCase();
        return upper.length() > 60 ? upper.substring(0, 60) : upper;
    }

    private String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= MAX_ERROR_LENGTH ? value : value.substring(0, MAX_ERROR_LENGTH);
    }
}
