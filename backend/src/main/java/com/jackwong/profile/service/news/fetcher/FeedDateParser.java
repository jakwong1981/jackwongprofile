// backend/src/main/java/com/jackwong/profile/service/news/fetcher/FeedDateParser.java
package com.jackwong.profile.service.news.fetcher;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * Tolerant parser for the publication timestamps found across RSS, Atom, and HTML sources.
 */
final class FeedDateParser {

    private static final List<DateTimeFormatter> OFFSET_FORMATS = List.of(
            DateTimeFormatter.RFC_1123_DATE_TIME,
            DateTimeFormatter.ISO_OFFSET_DATE_TIME,
            DateTimeFormatter.ISO_ZONED_DATE_TIME,
            DateTimeFormatter.ISO_INSTANT);

    private FeedDateParser() {
    }

    /**
     * @param raw timestamp text from the source, may be {@code null} or blank
     * @return the parsed instant, or empty when no known format matches
     */
    static Optional<Instant> parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return Optional.empty();
        }
        String value = raw.trim();
        for (DateTimeFormatter formatter : OFFSET_FORMATS) {
            try {
                return Optional.of(Instant.from(formatter.parse(value)));
            } catch (Exception ignored) {
                // Try the next known layout.
            }
        }
        try {
            return Optional.of(LocalDateTime.parse(value, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                    .toInstant(ZoneOffset.UTC));
        } catch (Exception ignored) {
            // Fall through to the date-only attempt.
        }
        try {
            return Optional.of(LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE)
                    .atStartOfDay(ZoneOffset.UTC).toInstant());
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }
}
