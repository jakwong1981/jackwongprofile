// backend/src/main/java/com/jackwong/profile/api/dto/response/NewsStatsResponse.java
package com.jackwong.profile.api.dto.response;

import java.util.List;

/**
 * Aggregate counters powering the news dashboard header.
 *
 * @param totalArticles    total rows stored
 * @param analyzedArticles rows with a completed DeepSeek analysis
 * @param pendingArticles  rows still awaiting analysis
 * @param failedArticles   rows whose analysis failed
 * @param categories       distinct taxonomy values currently in use
 * @param sources          per-source configuration and counters
 * @param lastRun          most recent aggregation cycle, {@code null} when never executed
 */
public record NewsStatsResponse(
        long totalArticles,
        long analyzedArticles,
        long pendingArticles,
        long failedArticles,
        List<String> categories,
        List<NewsSourceSummary> sources,
        NewsIngestionRunResponse lastRun) {

    /**
     * @param key         stable source identifier used for filtering
     * @param displayName human readable source label
     * @param siteUrl     canonical site address
     * @param enabled     whether the source participates in aggregation
     * @param articleCount number of stored articles from this source
     */
    public record NewsSourceSummary(String key, String displayName, String siteUrl, boolean enabled,
            long articleCount) {
    }
}
