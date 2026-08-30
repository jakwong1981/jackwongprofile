// backend/src/main/java/com/jackwong/profile/api/mapper/AdminUserMapper.java
package com.jackwong.profile.api.mapper;

import com.jackwong.profile.api.dto.response.AdminUserResponse;
import com.jackwong.profile.domain.entity.AdminUser;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * Entity -&gt; DTO translation for administrative accounts. The password hash is never mapped.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AdminUserMapper {

    AdminUserResponse toResponse(AdminUser adminUser);
}
