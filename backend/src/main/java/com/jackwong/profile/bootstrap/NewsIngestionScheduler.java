// backend/src/main/java/com/jackwong/profile/bootstrap/NewsIngestionScheduler.java
package com.jackwong.profile.bootstrap;

import com.jackwong.profile.config.NewsProperties;
import com.jackwong.profile.service.news.NewsIngestionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Fires the aggregation cycle on the configured cron schedule. Registered only when
 * {@code app.news.ingestion.enabled} is true, so local development stays offline by default.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.news.ingestion", name = "enabled", havingValue = "true")
public class NewsIngestionScheduler {

    private static final String TRIGGERED_BY = "scheduler";

    private final NewsIngestionService newsIngestionService;
    private final NewsProperties newsProperties;

    @Scheduled(cron = "${app.news.ingestion.cron}")
    public void ingestOnSchedule() {
        try {
            newsIngestionService.ingest(List.of(), newsProperties.ingestion().autoAnalyze(), TRIGGERED_BY);
        } catch (RuntimeException ex) {
            // Never let a scheduled failure kill the scheduler thread.
            log.error("Scheduled news ingestion failed", ex);
        }
    }
}
