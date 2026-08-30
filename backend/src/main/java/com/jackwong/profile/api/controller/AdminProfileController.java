// backend/src/main/java/com/jackwong/profile/api/controller/AdminProfileController.java
package com.jackwong.profile.api.controller;

import com.jackwong.profile.api.dto.request.ProfileUpdateRequest;
import com.jackwong.profile.api.dto.response.ProfileResponse;
import com.jackwong.profile.common.api.ApiResponse;
import com.jackwong.profile.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Administrative CRUD over the profile aggregate root.
 */
@RestController
@RequestMapping("/api/v1/admin/profiles")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin profile", description = "Authenticated profile maintenance")
public class AdminProfileController {

    private final ProfileService profileService;

    @GetMapping("/current")
    @Operation(summary = "Fetch the profile that backs the public site")
    public ResponseEntity<ApiResponse<ProfileResponse>> current() {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getDefaultProfile()));
    }

    @GetMapping("/{profileId}")
    @Operation(summary = "Fetch one profile by id")
    public ResponseEntity<ApiResponse<ProfileResponse>> getById(@PathVariable Long profileId) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getById(profileId)));
    }

    @PutMapping("/{profileId}")
    @Operation(summary = "Replace the scalar attributes of a profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> update(@PathVariable Long profileId,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.update(profileId, request), "Profile updated"));
    }
}
