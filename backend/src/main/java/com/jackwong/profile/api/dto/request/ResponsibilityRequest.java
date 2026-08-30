// backend/src/main/java/com/jackwong/profile/api/dto/request/ResponsibilityRequest.java
package com.jackwong.profile.api.dto.request;

import com.jackwong.profile.domain.vo.LocalizedText;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * One responsibility bullet inside a {@link PositionRequest}.
 *
 * @param id      existing row id, {@code null} to create a new bullet
 * @param content localised bullet text, at least one translation is required
 */
public record ResponsibilityRequest(
        Long id,
        @NotNull(message = "Responsibility content is required") @Valid LocalizedText content) {
}
