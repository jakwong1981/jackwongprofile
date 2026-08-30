// backend/src/main/java/com/jackwong/profile/api/dto/response/AdminUserResponse.java
package com.jackwong.profile.api.dto.response;

import java.time.Instant;

/**
 * Non sensitive projection of an administrative account.
 */
public record AdminUserResponse(Long id, String username, String displayName, String role, Instant lastLoginAt) {
}
