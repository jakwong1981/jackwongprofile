// backend/src/main/java/com/jackwong/profile/domain/entity/NewsIngestionRun.java
package com.jackwong.profile.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Audit record of a single aggregation cycle across all configured news sources.
 */
@Entity
@Table(name = "news_ingestion_run")
@Getter
@Setter
@NoArgsConstructor
public class NewsIngestionRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private IngestionStatus status = IngestionStatus.RUNNING;

    @Column(name = "source_count", nullable = false)
    private int sourceCount;

    @Column(name = "fetched_count", nullable = false)
    private int fetchedCount;

    @Column(name = "created_count", nullable = false)
    private int createdCount;

    @Column(name = "analyzed_count", nullable = false)
    private int analyzedCount;

    @Column(name = "failed_count", nullable = false)
    private int failedCount;

    @Column(name = "triggered_by", length = 60)
    private String triggeredBy;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
}
