// backend/src/main/java/com/jackwong/profile/api/dto/response/PositionResponse.java
package com.jackwong.profile.api.dto.response;

import com.jackwong.profile.domain.vo.LocalizedText;
import java.time.LocalDate;
import java.util.List;

/**
 * A job title held at one employer, with its itemised responsibilities.
 */
public record PositionResponse(
        Long id,
        LocalizedText title,
        String employmentType,
        LocalDate startDate,
        LocalDate endDate,
        boolean currentRole,
        int displayOrder,
        List<ResponsibilityResponse> responsibilities) {
}
