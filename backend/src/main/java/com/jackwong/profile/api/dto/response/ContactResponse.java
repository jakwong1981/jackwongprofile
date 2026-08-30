// backend/src/main/java/com/jackwong/profile/api/dto/response/ContactResponse.java
package com.jackwong.profile.api.dto.response;

/**
 * Public contact channels exposed on the profile.
 */
public record ContactResponse(
        String email,
        String phone,
        String facebookUrl,
        String instagramUrl,
        String xiaohongshuUrl,
        String linkedinUrl,
        String githubUrl,
        String websiteUrl) {
}
