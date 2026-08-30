// backend/src/main/java/com/jackwong/profile/api/dto/request/RefreshTokenRequest.java
package com.jackwong.profile.api.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Exchanges a refresh token for a new access token.
 */
public record RefreshTokenRequest(@NotBlank(message = "Refresh token is required") String refreshToken) {
}
