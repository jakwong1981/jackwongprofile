// backend/src/main/java/com/jackwong/profile/api/dto/request/ProfileUpdateRequest.java
package com.jackwong.profile.api.dto.request;

import com.jackwong.profile.domain.vo.LocalizedText;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Full replacement of the scalar attributes of a profile. Nested collections
 * (experience, education, certifications) are maintained through their own endpoints.
 */
public record ProfileUpdateRequest(
        @NotBlank(message = "Slug is required")
        @Size(max = 64, message = "Slug must not exceed 64 characters")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug may only contain lowercase letters, digits, and single hyphens")
        String slug,

        @NotBlank(message = "Full name is required")
        @Size(max = 120, message = "Full name must not exceed 120 characters")
        String fullName,

        @Valid LocalizedText localizedFullName,
        @Valid LocalizedText headline,
        @Valid LocalizedText jobTitle,

        @Size(max = 160, message = "Company name must not exceed 160 characters")
        String companyName,

        @Size(max = 160, message = "Location must not exceed 160 characters")
        String location,

        @Valid LocalizedText summary,

        @Size(max = 512, message = "Avatar URL must not exceed 512 characters")
        String avatarUrl,

        @Email(message = "Email must be a well-formed address")
        @Size(max = 190, message = "Email must not exceed 190 characters")
        String email,

        @Pattern(regexp = "^$|^[+0-9][0-9 ()\\-]{4,39}$", message = "Phone number format is invalid")
        String phone,

        @Size(max = 512, message = "Facebook URL must not exceed 512 characters") String facebookUrl,
        @Size(max = 512, message = "Instagram URL must not exceed 512 characters") String instagramUrl,
        @Size(max = 512, message = "Xiaohongshu URL must not exceed 512 characters") String xiaohongshuUrl,
        @Size(max = 512, message = "LinkedIn URL must not exceed 512 characters") String linkedinUrl,
        @Size(max = 512, message = "GitHub URL must not exceed 512 characters") String githubUrl,
        @Size(max = 512, message = "Website URL must not exceed 512 characters") String websiteUrl,

        Boolean published) {
}
