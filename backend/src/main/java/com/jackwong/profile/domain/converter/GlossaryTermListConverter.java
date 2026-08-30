// backend/src/main/java/com/jackwong/profile/domain/converter/GlossaryTermListConverter.java
package com.jackwong.profile.domain.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.jackwong.profile.domain.vo.GlossaryTerm;
import jakarta.persistence.Converter;
import java.util.List;

/**
 * Persists the extracted keyword glossary as a JSON array of {@link GlossaryTerm}.
 */
@Converter(autoApply = false)
public class GlossaryTermListConverter extends JsonListConverter<GlossaryTerm> {

    private static final TypeReference<List<GlossaryTerm>> TYPE = new TypeReference<>() {
    };

    @Override
    protected TypeReference<List<GlossaryTerm>> typeReference() {
        return TYPE;
    }
}
