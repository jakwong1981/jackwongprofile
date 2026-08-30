// backend/src/main/java/com/jackwong/profile/api/mapper/ExperienceMapper.java
package com.jackwong.profile.api.mapper;

import com.jackwong.profile.api.dto.request.ExperienceRequest;
import com.jackwong.profile.api.dto.request.PositionRequest;
import com.jackwong.profile.api.dto.response.ExperienceResponse;
import com.jackwong.profile.api.dto.response.PositionResponse;
import com.jackwong.profile.api.dto.response.ResponsibilityResponse;
import com.jackwong.profile.domain.entity.Experience;
import com.jackwong.profile.domain.entity.JobPosition;
import com.jackwong.profile.domain.entity.Responsibility;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/**
 * Entity &lt;-&gt; DTO translation for the work experience sub-aggregate.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ExperienceMapper {

    ExperienceResponse toResponse(Experience experience);

    List<ExperienceResponse> toResponseList(List<Experience> experiences);

    PositionResponse toPositionResponse(JobPosition position);

    ResponsibilityResponse toResponsibilityResponse(Responsibility responsibility);

    /**
     * Copies the scalar attributes of an incoming payload onto a managed entity.
     * Relationship fields are reconciled by the service so JPA orphan removal stays correct.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "positions", ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(ExperienceRequest request, @MappingTarget Experience experience);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "experience", ignore = true)
    @Mapping(target = "responsibilities", ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updatePositionFromRequest(PositionRequest request, @MappingTarget JobPosition position);
}
