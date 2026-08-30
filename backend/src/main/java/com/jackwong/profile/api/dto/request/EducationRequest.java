// backend/src/main/java/com/jackwong/profile/api/dto/request/EducationRequest.java
package com.jackwong.profile.api.dto.request;

import com.jackwong.profile.domain.vo.LocalizedText;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Create or replace payload for one academic record.
 */
public record EducationRequest(
        @NotBlank(message = "Institution is required")
        @Size(max = 200, message = "Institution must not exceed 200 characters")
        String institution,

        @Valid LocalizedText localizedInstitution,
        @Valid LocalizedText degree,
        @Valid LocalizedText fieldOfStudy,

        @Size(max = 160, message = "Location must not exceed 160 characters") String location,
        LocalDate startDate,
        LocalDate endDate,
        @Size(max = 60, message = "Grade must not exceed 60 characters") String grade,
        @Size(max = 120, message = "Credential id must not exceed 120 characters") String credentialId,
        @Size(max = 512, message = "Credential URL must not exceed 512 characters") String credentialUrl,
        @Valid LocalizedText description) {
}
