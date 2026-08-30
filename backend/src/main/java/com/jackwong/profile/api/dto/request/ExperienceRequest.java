// backend/src/main/java/com/jackwong/profile/api/dto/request/ExperienceRequest.java
package com.jackwong.profile.api.dto.request;

import com.jackwong.profile.domain.vo.LocalizedText;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/**
 * Create or replace payload for one employer, including the full nested set of job titles.
 * The submitted list order is authoritative: it defines {@code displayOrder} on write.
 */
public record ExperienceRequest(
        @NotBlank(message = "Company name is required")
        @Size(max = 160, message = "Company name must not exceed 160 characters")
        String companyName,

        @Size(max = 512, message = "Company URL must not exceed 512 characters") String companyUrl,
        @Size(max = 512, message = "Logo URL must not exceed 512 characters") String logoUrl,
        @Size(max = 160, message = "Location must not exceed 160 characters") String location,
        @Size(max = 40, message = "Employment type must not exceed 40 characters") String employmentType,

        @NotNull(message = "Start date is required") LocalDate startDate,
        LocalDate endDate,
        boolean currentRole,

        @Valid LocalizedText description,

        @NotEmpty(message = "At least one position is required")
        @Valid List<PositionRequest> positions) {
}
