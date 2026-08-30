// backend/src/main/java/com/jackwong/profile/api/dto/response/ProfileResponse.java
package com.jackwong.profile.api.dto.response;

import com.jackwong.profile.domain.vo.LocalizedText;
import java.time.Instant;
import java.util.List;

/**
 * Full profile aggregate. Every translation is returned so the client can switch locale
 * at runtime without another round trip.
 */
public record ProfileResponse(
        Long id,
        String slug,
        String fullName,
        LocalizedText localizedFullName,
        LocalizedText headline,
        LocalizedText jobTitle,
        String companyName,
        String location,
        LocalizedText summary,
        String avatarUrl,
        boolean published,
        ContactResponse contact,
        List<ExperienceResponse> experiences,
        List<EducationResponse> educations,
        List<CertificationResponse> certifications,
        Instant updatedAt) {
}
