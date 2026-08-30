// backend/src/main/java/com/jackwong/profile/api/dto/response/CertificationResponse.java
package com.jackwong.profile.api.dto.response;

import com.jackwong.profile.domain.vo.LocalizedText;
import java.time.LocalDate;

/**
 * One professional credential with issuer and verification metadata.
 */
public record CertificationResponse(
        Long id,
        LocalizedText name,
        String issuingOrganization,
        LocalDate issueDate,
        LocalDate expirationDate,
        String credentialId,
        String credentialUrl,
        LocalizedText description,
        int displayOrder) {
}
