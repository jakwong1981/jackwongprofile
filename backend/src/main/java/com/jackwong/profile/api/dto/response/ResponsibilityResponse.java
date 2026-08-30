// backend/src/main/java/com/jackwong/profile/api/dto/response/ResponsibilityResponse.java
package com.jackwong.profile.api.dto.response;

import com.jackwong.profile.domain.vo.LocalizedText;

/**
 * One duty / achievement bullet of a job title.
 */
public record ResponsibilityResponse(Long id, LocalizedText content, int displayOrder) {
}
