// backend/src/main/java/com/jackwong/profile/api/dto/request/NewsIngestionRequest.java
package com.jackwong.profile.api.dto.request;

import java.util.List;

/**
 * Manual trigger for a news aggregation cycle.
 *
 * @param sourceKeys restrict the cycle to these source keys; empty or {@code null} means all enabled sources
 * @param analyze    whether to run DeepSeek enrichment on newly stored articles
 */
public record NewsIngestionRequest(List<String> sourceKeys, Boolean analyze) {

    public List<String> safeSourceKeys() {
        return sourceKeys == null ? List.of() : sourceKeys;
    }

    public boolean shouldAnalyze(boolean defaultValue) {
        return analyze == null ? defaultValue : analyze;
    }
}
