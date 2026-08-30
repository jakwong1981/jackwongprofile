// backend/src/main/java/com/jackwong/profile/api/mapper/ProfileMapper.java
package com.jackwong.profile.api.mapper;

import com.jackwong.profile.api.dto.request.ProfileUpdateRequest;
import com.jackwong.profile.api.dto.response.ContactResponse;
import com.jackwong.profile.api.dto.response.ProfileResponse;
import com.jackwong.profile.domain.entity.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/**
 * Entity &lt;-&gt; DTO translation for the profile aggregate root.
 */
@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {ExperienceMapper.class, EducationMapper.class, CertificationMapper.class})
public interface ProfileMapper {

    /** Flat contact columns are re-grouped into a nested object for the API contract. */
    @Mapping(target = "contact", source = ".")
    ProfileResponse toResponse(Profile profile);

    ContactResponse toContact(Profile profile);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "experiences", ignore = true)
    @Mapping(target = "educations", ignore = true)
    @Mapping(target = "certifications", ignore = true)
    @Mapping(target = "optlockVersion", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(ProfileUpdateRequest request, @MappingTarget Profile profile);
}
