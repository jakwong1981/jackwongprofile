// backend/src/main/java/com/jackwong/profile/api/dto/response/NewsArticleResponse.java
package com.jackwong.profile.api.dto.response;

import com.jackwong.profile.domain.entity.AnalysisStatus;
import com.jackwong.profile.domain.entity.ImpactLevel;
import com.jackwong.profile.domain.vo.GlossaryTerm;
import java.time.Instant;
import java.util.List;

/**
 * One aggregated news item together with its DeepSeek enrichment.
 */
public record NewsArticleResponse(
        Long id,
        String sourceKey,
        String sourceName,
        String title,
        String url,
        String author,
        Instant publishedAt,
        String excerpt,
        String summary,
        List<String> keyPoints,
        List<GlossaryTerm> keywords,
        String category,
        ImpactLevel impactLevel,
        AnalysisStatus analysisStatus,
        Instant fetchedAt,
        Instant analyzedAt) {
}
