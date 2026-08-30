// backend/src/main/java/com/jackwong/profile/integration/deepseek/ArticleAnalysis.java
package com.jackwong.profile.integration.deepseek;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.jackwong.profile.domain.vo.GlossaryTerm;
import java.util.List;

/**
 * Structured enrichment returned by the DeepSeek analysis prompt.
 *
 * @param summary     executive summary, two to four sentences
 * @param keyPoints   bullet takeaways
 * @param keywords    domain glossary extracted from the article
 * @param category    single taxonomy label
 * @param impactLevel qualitative significance (LOW / MEDIUM / HIGH / CRITICAL)
 * @param language    detected language tag of the source article
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ArticleAnalysis(
        String summary,
        List<String> keyPoints,
        List<GlossaryTerm> keywords,
        String category,
        String impactLevel,
        String language) {

    public List<String> safeKeyPoints() {
        return keyPoints == null ? List.of() : keyPoints;
    }

    public List<GlossaryTerm> safeKeywords() {
        return keywords == null ? List.of() : keywords;
    }
}
