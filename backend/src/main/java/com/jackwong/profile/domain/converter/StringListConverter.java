// backend/src/main/java/com/jackwong/profile/domain/converter/StringListConverter.java
package com.jackwong.profile.domain.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.persistence.Converter;
import java.util.List;

/**
 * Persists a list of plain strings (for example article key points) as a JSON array.
 */
@Converter(autoApply = false)
public class StringListConverter extends JsonListConverter<String> {

    private static final TypeReference<List<String>> TYPE = new TypeReference<>() {
    };

    @Override
    protected TypeReference<List<String>> typeReference() {
        return TYPE;
    }
}
