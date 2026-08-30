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
        try {
            return MAPPER.readValue(dbData, LocalizedText.class);
        } catch (JsonProcessingException ex) {
            // Legacy rows may hold a plain string; degrade gracefully instead of failing the read.
            log.warn("Falling back to plain-text LocalizedText for value starting with '{}'",
                    dbData.substring(0, Math.min(32, dbData.length())));
            return LocalizedText.of(dbData);
        }
    }
}
