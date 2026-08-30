// backend/src/main/java/com/jackwong/profile/api/dto/response/AuthTokenResponse.java
package com.jackwong.profile.api.dto.response;

/**
 * Issued credential pair returned by the authentication endpoints.
 *
 * @param accessToken      short lived bearer token
 * @param refreshToken     long lived token used to mint a new access token
 * @param tokenType        always {@code Bearer}
 * @param expiresInSeconds remaining lifetime of {@code accessToken}
 * @param user             the authenticated operator
 */
public record AuthTokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        AdminUserResponse user) {
}
