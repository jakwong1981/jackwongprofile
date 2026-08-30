// backend/src/main/java/com/jackwong/profile/api/dto/request/LoginRequest.java
package com.jackwong.profile.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Administrative sign-in payload.
 */
public record LoginRequest(
        @NotBlank(message = "Username is required")
        @Size(max = 64, message = "Username must not exceed 64 characters")
        String username,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
        String password) {
}
