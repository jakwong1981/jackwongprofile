// backend/src/main/java/com/jackwong/profile/api/dto/request/PositionRequest.java
package com.jackwong.profile.api.dto.request;

import com.jackwong.profile.domain.vo.LocalizedText;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/**
 * One job title held at an employer, submitted as part of the enclosing experience payload.
 *
 * @param id               existing row id, {@code null} to create
 * @param title            localised job title
 * @param employmentType   free-form employment type token (FULL_TIME, CONTRACT, ...)
 * @param startDate        first day in the role
 * @param endDate          last day in the role, {@code null} while current
 * @param currentRole      whether the role is ongoing
 * @param responsibilities ordered duty bullets; list order defines display order
 */
public record PositionRequest(
        Long id,
        @NotNull(message = "Position title is required") @Valid LocalizedText title,
        @Size(max = 40, message = "Employment type must not exceed 40 characters") String employmentType,
        @NotNull(message = "Position start date is required") LocalDate startDate,
        LocalDate endDate,
        boolean currentRole,
        @Valid List<ResponsibilityRequest> responsibilities) {
}
