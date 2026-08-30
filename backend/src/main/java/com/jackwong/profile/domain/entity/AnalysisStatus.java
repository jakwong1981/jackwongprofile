// backend/src/main/java/com/jackwong/profile/domain/entity/AnalysisStatus.java
package com.jackwong.profile.domain.entity;

/**
 * Lifecycle of the DeepSeek enrichment attached to a {@link NewsArticle}.
 */
public enum AnalysisStatus {
    /** Fetched but not yet analysed. */
    PENDING,
    /** Enrichment is currently running. */
    IN_PROGRESS,
    /** Summary, keywords, and classification are available. */
    COMPLETED,
    /** The model call failed; {@code analysisError} carries the reason. */
    FAILED,
    /** Analysis intentionally not attempted (integration disabled). */
    SKIPPED
}
