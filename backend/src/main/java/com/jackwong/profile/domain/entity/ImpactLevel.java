// backend/src/main/java/com/jackwong/profile/domain/entity/ImpactLevel.java
package com.jackwong.profile.domain.entity;

/**
 * Relative significance assigned to an article by the analysis model.
 */
public enum ImpactLevel {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL;

    /**
     * @param raw model supplied value, case insensitive and possibly {@code null}
     * @return the matching level, or {@link #MEDIUM} when unrecognised
     */
    public static ImpactLevel fromRaw(String raw) {
        if (raw == null || raw.isBlank()) {
            return MEDIUM;
        }
        for (ImpactLevel level : values()) {
            if (level.name().equalsIgnoreCase(raw.trim())) {
                return level;
            }
        }
        return MEDIUM;
    }
}
