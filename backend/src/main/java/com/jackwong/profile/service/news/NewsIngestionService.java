// backend/src/main/java/com/jackwong/profile/service/news/NewsIngestionService.java
package com.jackwong.profile.service.news;

import com.jackwong.profile.api.dto.response.NewsIngestionRunResponse;
import com.jackwong.profile.api.mapper.NewsMapper;
import com.jackwong.profile.common.api.ErrorCode;
import com.jackwong.profile.common.exception.BusinessException;
import com.jackwong.profile.config.NewsProperties;
import com.jackwong.profile.domain.entity.IngestionStatus;
import com.jackwong.profile.domain.entity.NewsArticle;
import com.jackwong.profile.domain.entity.NewsIngestionRun;
import com.jackwong.profile.repository.NewsArticleRepository;
import com.jackwong.profile.service.news.fetcher.FetchedArticle;
import com.jackwong.profile.service.news.fetcher.NewsFetcher;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Orchestrates one aggregation cycle: fetch every enabled source, persist the new items,
 * then optionally enrich them. Deliberately not transactional — network calls happen here and
 * every database write is delegated to {@link NewsPersistenceService} in its own transaction.
 */
@Slf4j
@Service
public class NewsIngestionService {

    /** Guards against overlapping cycles when a manual trigger races the scheduler. */
    private final AtomicBoolean running = new AtomicBoolean(false);

    private final NewsProperties newsProperties;
    private final NewsPersistenceService persistenceService;
    private final NewsAnalysisService analysisService;
    private final NewsArticleRepository newsArticleRepository;
    private final NewsMapper newsMapper;
    private final Map<NewsProperties.SourceType, NewsFetcher> fetchers =
            new EnumMap<>(NewsProperties.SourceType.class);

    public NewsIngestionService(NewsProperties newsProperties,
            NewsPersistenceService persistenceService,
            NewsAnalysisService analysisService,
            NewsArticleRepository newsArticleRepository,
            NewsMapper newsMapper,
            List<NewsFetcher> availableFetchers) {
        this.newsProperties = newsProperties;
        this.persistenceService = persistenceService;
        this.analysisService = analysisService;
        this.newsArticleRepository = newsArticleRepository;
        this.newsMapper = newsMapper;
        availableFetchers.forEach(fetcher -> this.fetchers.put(fetcher.supports(), fetcher));
    }

    /**
     * Runs one aggregation cycle.
     *
     * @param sourceKeys  restrict to these source keys; empty means every enabled source
     * @param analyze     whether to run DeepSeek enrichment on the newly stored items
     * @param triggeredBy audit label (username or {@code scheduler})
     * @return the completed run record
     * @throws BusinessException when a cycle is already in flight or no source matches
     */
    public NewsIngestionRunResponse ingest(List<String> sourceKeys, boolean analyze, String triggeredBy) {
        if (!running.compareAndSet(false, true)) {
            throw new BusinessException(ErrorCode.RESOURCE_CONFLICT, "A news ingestion cycle is already running");
        }
        try {
            return runCycle(resolveSources(sourceKeys), analyze, triggeredBy);
        } finally {
            running.set(false);
        }
    }

    private NewsIngestionRunResponse runCycle(List<NewsProperties.Source> sources, boolean analyze,
            String triggeredBy) {
        NewsIngestionRun run = persistenceService.startRun(triggeredBy, sources.size());
        int fetched = 0;
        int created = 0;
        int failedSources = 0;
        List<Long> createdIds = new ArrayList<>();
        List<String> failures = new ArrayList<>();

        for (NewsProperties.Source source : sources) {
            try {
                List<FetchedArticle> batch = fetchSource(source);
                fetched += batch.size();
                List<Long> ids = persistenceService.persistBatch(source, batch);
                createdIds.addAll(ids);
                created += ids.size();
                log.info("Source {} yielded {} item(s), {} new", source.key(), batch.size(), ids.size());
            } catch (RuntimeException ex) {
                failedSources++;
                failures.add("%s: %s".formatted(source.key(), ex.getMessage()));
                log.warn("Source {} failed: {}", source.key(), ex.getMessage());
            }
        }

        int analyzed = 0;
        if (analyze && !createdIds.isEmpty()) {
            List<NewsArticle> articles = newsArticleRepository.findAllById(createdIds);
            analyzed = analysisService.analyze(articles);
        }

        IngestionStatus status = resolveStatus(sources.size(), failedSources);
        String message = failures.isEmpty() ? null : String.join(" | ", failures);
        NewsIngestionRun completed = persistenceService.completeRun(run.getId(), status, fetched, created, analyzed,
                failedSources, message);
        return newsMapper.toRunResponse(completed);
    }

    private List<FetchedArticle> fetchSource(NewsProperties.Source source) {
        NewsFetcher fetcher = fetchers.get(source.type());
        if (fetcher == null) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR,
                    "No fetcher registered for source type %s".formatted(source.type()));
        }
        return fetcher.fetch(source, newsProperties.ingestion().maxItemsPerSource());
    }

    private List<NewsProperties.Source> resolveSources(List<String> sourceKeys) {
        List<NewsProperties.Source> enabled = newsProperties.enabledSources();
        if (sourceKeys == null || sourceKeys.isEmpty()) {
            if (enabled.isEmpty()) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "No news source is enabled");
            }
            return enabled;
        }
        List<NewsProperties.Source> selected = enabled.stream()
                .filter(source -> sourceKeys.stream().anyMatch(key -> key.equalsIgnoreCase(source.key())))
                .toList();
        if (selected.isEmpty()) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                    "None of the requested source keys is enabled: " + sourceKeys);
        }
        return selected;
    }

    private IngestionStatus resolveStatus(int total, int failed) {
        if (failed == 0) {
            return IngestionStatus.SUCCESS;
        }
        return failed >= total ? IngestionStatus.FAILED : IngestionStatus.PARTIAL;
    }
}
