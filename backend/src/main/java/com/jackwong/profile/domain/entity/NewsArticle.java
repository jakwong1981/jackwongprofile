// backend/src/main/java/com/jackwong/profile/domain/entity/NewsArticle.java
package com.jackwong.profile.domain.entity;

import com.jackwong.profile.domain.converter.GlossaryTermListConverter;
import com.jackwong.profile.domain.converter.StringListConverter;
import com.jackwong.profile.domain.vo.GlossaryTerm;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One aggregated AI news item, optionally enriched with a DeepSeek generated summary,
 * key points, keyword glossary, and taxonomy classification.
 */
@Entity
@Table(name = "news_article")
@Getter
@Setter
@NoArgsConstructor
public class NewsArticle extends AuditableEntity {

    @Column(name = "source_key", nullable = false, length = 40)
    private String sourceKey;

    @Column(name = "source_name", nullable = false, length = 120)
    private String sourceName;

    /** SHA-256 of the canonical URL; the deduplication key, since the URL itself is too long to index. */
    @Column(name = "external_id", nullable = false, length = 64, updatable = false)
    private String externalId;

    @Column(name = "title", nullable = false, length = 512)
    private String title;

    @Column(name = "url", nullable = false, length = 1024)
    private String url;

    @Column(name = "author", length = 160)
    private String author;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "excerpt", columnDefinition = "TEXT")
    private String excerpt;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Convert(converter = StringListConverter.class)
    @Column(name = "key_points", columnDefinition = "TEXT")
    private List<String> keyPoints = new ArrayList<>();

    @Convert(converter = GlossaryTermListConverter.class)
    @Column(name = "keywords", columnDefinition = "TEXT")
    private List<GlossaryTerm> keywords = new ArrayList<>();

    @Column(name = "category", length = 60)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "impact_level", length = 20)
    private ImpactLevel impactLevel;

    @Column(name = "language", length = 12)
    private String language;

    @Enumerated(EnumType.STRING)
    @Column(name = "analysis_status", nullable = false, length = 20)
    private AnalysisStatus analysisStatus = AnalysisStatus.PENDING;

    @Column(name = "analysis_error", length = 512)
    private String analysisError;

    @Column(name = "fetched_at", nullable = false)
    private Instant fetchedAt;

    @Column(name = "analyzed_at")
    private Instant analyzedAt;
}
