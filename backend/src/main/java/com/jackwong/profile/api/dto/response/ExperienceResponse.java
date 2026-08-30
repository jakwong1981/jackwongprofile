// backend/src/main/java/com/jackwong/profile/api/dto/response/ExperienceResponse.java
package com.jackwong.profile.api.dto.response;

import com.jackwong.profile.domain.vo.LocalizedText;
import java.time.LocalDate;
import java.util.List;

/**
 * One employer with the ordered list of titles held there.
 */
public record ExperienceResponse(
        Long id,
        String companyName,
        String companyUrl,
        String logoUrl,
        String location,
        String employmentType,
        LocalDate startDate,
        LocalDate endDate,
        boolean currentRole,
        LocalizedText description,
        int displayOrder,
        List<PositionResponse> positions) {
}
