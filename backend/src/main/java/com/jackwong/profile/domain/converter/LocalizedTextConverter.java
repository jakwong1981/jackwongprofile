// backend/src/main/java/com/jackwong/profile/domain/converter/LocalizedTextConverter.java
package com.jackwong.profile.domain.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.jackwong.profile.domain.vo.LocalizedText;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

/**
 * Persists {@link LocalizedText} as a compact JSON document inside a single TEXT column.
 * Keeping the translations in one column avoids a wide table of per-locale columns while
 * remaining fully parameterised (no dynamic SQL is ever produced).
 */
@Slf4j
@Converter(autoApply = false)
public class LocalizedTextConverter implements AttributeConverter<LocalizedText, String> {

    private static final ObjectMapper MAPPER = JsonMapper.builder()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();

    @Override
    public String convertToDatabaseColumn(LocalizedText attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (JsonProcessingException ex) {
            log.error("Unable to serialise LocalizedText", ex);
            throw new IllegalStateException("Unable to serialise LocalizedText", ex);
        }
    }

    @Override
    public LocalizedText convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        // Sanitize: replace any literal control characters (newlines, tabs, carriage returns)
        // that were stored unescaped inside the JSON string values.  These are illegal per the
        // JSON spec and cause Jackson to reject an otherwise valid document.
        String sanitized = dbData
                .replace("\r\n", "\\n")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
        try {
            LocalizedText result = MAPPER.readValue(sanitized, LocalizedText.class);
            // Guard against the case where the value parsed successfully as a LocalizedText
            // but one of its locale slots actually contains a further-encoded LocalizedText
            // JSON string (i.e. the en field holds "{\"en\":\"...\",\"zhHant\":\"...\"}").
            // Unwrap one extra layer when detected.
            if (result.en() != null) {
                String en = result.en().trim();
                if (en.startsWith("{") && en.endsWith("}")) {
                    try {
                        LocalizedText inner = MAPPER.readValue(en, LocalizedText.class);
                        log.warn("Unwrapping double-encoded LocalizedText found in `en` field");
                        return inner;
                    } catch (JsonProcessingException ignored) {
                        // en field is just a plain string that starts with '{'; keep as-is
                    }
                }
            }
            return result;
        } catch (JsonProcessingException ex) {
            // The column value may be a double-encoded string — a JSON string whose content is
            // itself a serialised LocalizedText object (e.g. "{\"en\":\"...\",\"zhHant\":\"...\"}").
            // This can happen when the value was saved by an older version that accidentally
            // serialised an already-serialised payload.  Try to unwrap one extra layer first.
            try {
                String inner = MAPPER.readValue(sanitized, String.class);
                return MAPPER.readValue(inner, LocalizedText.class);
            } catch (JsonProcessingException innerEx) {
                // Not double-encoded either — treat as a legacy plain-text value.
            }
            log.warn("Falling back to plain-text LocalizedText for value starting with '{}'",
                    dbData.substring(0, Math.min(32, dbData.length())));
            return LocalizedText.of(dbData);
        }
    }
}
