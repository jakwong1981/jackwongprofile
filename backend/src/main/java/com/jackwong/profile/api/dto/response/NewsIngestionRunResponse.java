// backend/src/main/java/com/jackwong/profile/api/dto/response/NewsIngestionRunResponse.java
package com.jackwong.profile.api.dto.response;

import com.jackwong.profile.domain.entity.IngestionStatus;
import java.time.Instant;

/**
 * Audit summary of one aggregation cycle.
 */
public record NewsIngestionRunResponse(
        Long id,
        Instant startedAt,
        Instant finishedAt,
        IngestionStatus status,
        int sourceCount,
        int fetchedCount,
        int createdCount,
        int analyzedCount,
        int failedCount,
        String triggeredBy,
        String message) {
}
