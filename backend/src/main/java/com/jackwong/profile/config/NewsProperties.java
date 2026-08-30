// backend/src/main/java/com/jackwong/profile/config/NewsProperties.java
package com.jackwong.profile.config;

import java.util.List;
import java.util.Optional;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Declarative configuration of the AI news aggregator: schedule plus the target sources.
 * Keeping sources in configuration means a new feed is a YAML change, not a code change.
 *
 * @param ingestion scheduling and fetch behaviour
 * @param sources   ordered list of feeds to aggregate
 */
@ConfigurationProperties(prefix = "app.news")
public record NewsProperties(Ingestion ingestion, List<Source> sources) {

    /**
     * @param enabled           whether the scheduled cycle is armed
     * @param cron              Spring cron expression for the automatic cycle
     * @param maxItemsPerSource upper bound of items accepted per source per cycle
     * @param userAgent         User-Agent header sent to every source
     * @param requestTimeoutMs  per-request timeout
     * @param autoAnalyze       whether newly stored articles are enriched immediately
     */
    public record Ingestion(
            boolean enabled,
            String cron,
            int maxItemsPerSource,
            String userAgent,
            int requestTimeoutMs,
            boolean autoAnalyze) {
    }

    /**
     * @param key           stable identifier persisted on every article
     * @param displayName   human readable label shown in the dashboard
     * @param siteUrl       canonical site address, used to absolutise relative links
     * @param feedUrl       RSS/Atom feed or HTML index to fetch
     * @param type          parsing strategy
     * @param itemSelector  CSS selector locating one item, HTML sources only
     * @param titleSelector selector for the title inside an item, or {@code self}
     * @param linkSelector  selector for the link inside an item, or {@code self}
     * @param enabled       whether this source participates in aggregation
     */
    public record Source(
            String key,
            String displayName,
            String siteUrl,
            String feedUrl,
            SourceType type,
            String itemSelector,
            String titleSelector,
            String linkSelector,
            boolean enabled) {
    }

    /** Parsing strategy for a configured source. */
    public enum SourceType {
        /** RSS or Atom XML document. */
        RSS,
        /** HTML index page scraped with CSS selectors. */
        HTML
    }

    public List<Source> safeSources() {
        return sources == null ? List.of() : sources;
    }

    public List<Source> enabledSources() {
        return safeSources().stream().filter(Source::enabled).toList();
    }

    public Optional<Source> findByKey(String key) {
        return safeSources().stream().filter(source -> source.key().equalsIgnoreCase(key)).findFirst();
    }
}
