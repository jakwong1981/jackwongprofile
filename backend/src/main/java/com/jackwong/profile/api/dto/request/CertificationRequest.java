// backend/src/main/java/com/jackwong/profile/api/dto/request/CertificationRequest.java
package com.jackwong.profile.api.dto.request;

import com.jackwong.profile.domain.vo.LocalizedText;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Create or replace payload for one professional credential.
 */
public record CertificationRequest(
        @NotNull(message = "Certification name is required") @Valid LocalizedText name,

        @NotBlank(message = "Issuing organization is required")
        @Size(max = 200, message = "Issuing organization must not exceed 200 characters")
        String issuingOrganization,

        LocalDate issueDate,
        LocalDate expirationDate,
        @Size(max = 120, message = "Credential id must not exceed 120 characters") String credentialId,
        @Size(max = 512, message = "Credential URL must not exceed 512 characters") String credentialUrl,
        @Valid LocalizedText description) {
}
