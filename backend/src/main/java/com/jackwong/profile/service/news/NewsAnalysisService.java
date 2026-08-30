// backend/src/main/java/com/jackwong/profile/service/news/NewsAnalysisService.java
package com.jackwong.profile.service.news;

import com.jackwong.profile.api.dto.response.NewsArticleResponse;
import com.jackwong.profile.api.mapper.NewsMapper;
import com.jackwong.profile.common.exception.ResourceNotFoundException;
import com.jackwong.profile.domain.entity.NewsArticle;
import com.jackwong.profile.integration.deepseek.ArticleAnalysis;
import com.jackwong.profile.integration.deepseek.DeepSeekClient;
import com.jackwong.profile.repository.NewsArticleRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Drives DeepSeek enrichment over stored articles. Each article is analysed and committed
 * independently so one upstream failure never discards the whole batch.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NewsAnalysisService {

    private final DeepSeekClient deepSeekClient;
    private final NewsPersistenceService persistenceService;
    private final NewsArticleRepository newsArticleRepository;
    private final NewsMapper newsMapper;

    /**
     * Analyses the given articles.
     *
     * @param articles articles to enrich
     * @return the number of articles successfully analysed
     */
    public int analyze(List<NewsArticle> articles) {
        if (articles.isEmpty()) {
            return 0;
        }
        if (!deepSeekClient.isEnabled()) {
            log.info("DeepSeek disabled; marking {} article(s) as SKIPPED", articles.size());
            persistenceService.markAnalysisSkipped(articles.stream().map(NewsArticle::getId).toList());
            return 0;
        }

        int analyzed = 0;
        for (NewsArticle article : articles) {
            if (analyzeOne(article)) {
                analyzed++;
            }
        }
        log.info("DeepSeek analysis completed for {}/{} article(s)", analyzed, articles.size());
        return analyzed;
    }

    /**
     * @param article article to enrich
     * @return {@code true} when the analysis succeeded and was persisted
     */
    public boolean analyzeOne(NewsArticle article) {
        try {
            ArticleAnalysis analysis = deepSeekClient.analyze(
                    article.getTitle(), article.getSourceName(), article.getUrl(), article.getExcerpt());
            persistenceService.applyAnalysis(article.getId(), analysis);
            return true;
        } catch (RuntimeException ex) {
            log.warn("Analysis failed for article id={} url={}: {}", article.getId(), article.getUrl(),
                    ex.getMessage());
            persistenceService.markAnalysisFailed(article.getId(), ex.getMessage());
            return false;
        }
    }

    /**
     * Enriches the oldest still-pending articles.
     *
     * @param limit maximum number of articles to process
     * @return the number of articles successfully analysed
     */
    public int analyzePending(int limit) {
        return analyze(persistenceService.findPending(limit));
    }

    /**
     * Re-runs the analysis for one article regardless of its current status.
     *
     * @param articleId target article
     * @return the article state after the attempt
     * @throws ResourceNotFoundException when the article does not exist
     */
    public NewsArticleResponse analyzeById(Long articleId) {
        NewsArticle article = newsArticleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("NewsArticle", articleId));
        if (!deepSeekClient.isEnabled()) {
            persistenceService.markAnalysisSkipped(List.of(articleId));
        } else {
            analyzeOne(article);
        }
        return newsMapper.toResponse(newsArticleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("NewsArticle", articleId)));
    }
}
