// backend/src/main/java/com/jackwong/profile/api/dto/response/EducationResponse.java
package com.jackwong.profile.api.dto.response;

import com.jackwong.profile.domain.vo.LocalizedText;
import java.time.LocalDate;

/**
 * One academic record with credential metadata.
 */
public record EducationResponse(
        Long id,
        String institution,
        LocalizedText localizedInstitution,
        LocalizedText degree,
        LocalizedText fieldOfStudy,
        String location,
        LocalDate startDate,
        LocalDate endDate,
        String grade,
        String credentialId,
        String credentialUrl,
        LocalizedText description,
        int displayOrder) {
}
