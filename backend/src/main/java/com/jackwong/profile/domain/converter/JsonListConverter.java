// backend/src/main/java/com/jackwong/profile/domain/converter/JsonListConverter.java
package com.jackwong.profile.domain.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import jakarta.persistence.AttributeConverter;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

/**
 * Base class for converters that persist a {@link List} as a JSON array in a TEXT column.
 *
 * @param <T> element type
 */
@Slf4j
public abstract class JsonListConverter<T> implements AttributeConverter<List<T>, String> {

    protected static final ObjectMapper MAPPER = JsonMapper.builder()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();

    /**
     * @return the reified element type used for deserialisation
     */
    protected abstract TypeReference<List<T>> typeReference();

    @Override
    public String convertToDatabaseColumn(List<T> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (Exception ex) {
            log.error("Unable to serialise list attribute", ex);
            throw new IllegalStateException("Unable to serialise list attribute", ex);
        }
    }

    @Override
    public List<T> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return List.of();
        }
        try {
            List<T> parsed = MAPPER.readValue(dbData, typeReference());
            return parsed == null ? List.of() : parsed;
        } catch (Exception ex) {
            log.warn("Unable to deserialise list attribute, returning empty list: {}", ex.getMessage());
            return List.of();
        }
    }
}
