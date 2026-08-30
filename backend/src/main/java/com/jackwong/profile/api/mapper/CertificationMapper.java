// backend/src/main/java/com/jackwong/profile/api/mapper/CertificationMapper.java
package com.jackwong.profile.api.mapper;

import com.jackwong.profile.api.dto.request.CertificationRequest;
import com.jackwong.profile.api.dto.response.CertificationResponse;
import com.jackwong.profile.domain.entity.Certification;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/**
 * Entity &lt;-&gt; DTO translation for professional credentials.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CertificationMapper {

    CertificationResponse toResponse(Certification certification);

    List<CertificationResponse> toResponseList(List<Certification> certifications);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "displayOrder", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(CertificationRequest request, @MappingTarget Certification certification);
}
