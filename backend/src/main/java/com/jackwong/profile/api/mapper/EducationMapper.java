// backend/src/main/java/com/jackwong/profile/api/mapper/EducationMapper.java
package com.jackwong.profile.api.mapper;

import com.jackwong.profile.api.dto.request.EducationRequest;
import com.jackwong.profile.api.dto.response.EducationResponse;
import com.jackwong.profile.domain.entity.Education;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/**
 * Entity &lt;-&gt; DTO translation for academic records.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EducationMapper {

    EducationResponse toResponse(Education education);

    List<EducationResponse> toResponseList(List<Education> educations);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(EducationRequest request, @MappingTarget Education education);
}
