// backend/src/main/java/com/jackwong/profile/domain/entity/IngestionStatus.java
package com.jackwong.profile.domain.entity;

/**
 * Outcome of a news aggregation cycle.
 */
public enum IngestionStatus {
    /** Cycle is in flight. */
    RUNNING,
    /** Every configured source responded successfully. */
    SUCCESS,
    /** At least one source failed but others succeeded. */
    PARTIAL,
    /** Every configured source failed. */
    FAILED
}
