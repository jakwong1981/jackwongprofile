// backend/src/main/java/com/jackwong/profile/api/controller/PublicProfileController.java
package com.jackwong.profile.api.controller;

import com.jackwong.profile.api.dto.response.ProfileResponse;
import com.jackwong.profile.common.api.ApiResponse;
import com.jackwong.profile.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Unauthenticated delivery of the public profile.
 */
@Validated
@RestController
@RequestMapping("/api/v1/public/profile")
@RequiredArgsConstructor
@Tag(name = "Public profile", description = "Read-only profile delivery for the public site")
public class PublicProfileController {

    private final ProfileService profileService;

    @GetMapping
    @Operation(summary = "Fetch the profile that backs the public site")
    public ResponseEntity<ApiResponse<ProfileResponse>> getDefaultProfile() {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getDefaultProfile()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Fetch a profile by its public slug")
    public ResponseEntity<ApiResponse<ProfileResponse>> getBySlug(
            @PathVariable @NotBlank @Size(max = 64) String slug) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getBySlug(slug)));
    }
}
