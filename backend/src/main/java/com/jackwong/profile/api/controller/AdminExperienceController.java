// backend/src/main/java/com/jackwong/profile/api/controller/AdminExperienceController.java
package com.jackwong.profile.api.controller;

import com.jackwong.profile.api.dto.request.ExperienceRequest;
import com.jackwong.profile.api.dto.request.ReorderRequest;
import com.jackwong.profile.api.dto.response.ExperienceResponse;
import com.jackwong.profile.common.api.ApiResponse;
import com.jackwong.profile.service.ExperienceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Administrative CRUD over work experience, including the nested job titles.
 */
@RestController
@RequestMapping("/api/v1/admin/profiles/{profileId}/experiences")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin experience", description = "Authenticated work-experience maintenance")
public class AdminExperienceController {

    private final ExperienceService experienceService;

    @GetMapping
    @Operation(summary = "List all experience entries of a profile")
    public ResponseEntity<ApiResponse<List<ExperienceResponse>>> list(@PathVariable Long profileId) {
        return ResponseEntity.ok(ApiResponse.ok(experienceService.listByProfile(profileId)));
    }

    @GetMapping("/{experienceId}")
    @Operation(summary = "Fetch one experience entry")
    public ResponseEntity<ApiResponse<ExperienceResponse>> getById(@PathVariable Long profileId,
            @PathVariable Long experienceId) {
        return ResponseEntity.ok(ApiResponse.ok(experienceService.getById(profileId, experienceId)));
    }

    @PostMapping
    @Operation(summary = "Create an experience entry together with its positions")
    public ResponseEntity<ApiResponse<ExperienceResponse>> create(@PathVariable Long profileId,
            @Valid @RequestBody ExperienceRequest request) {
        ExperienceResponse created = experienceService.create(profileId, request);
        URI location = URI.create("/api/v1/admin/profiles/%d/experiences/%d".formatted(profileId, created.id()));
        return ResponseEntity.created(location).body(ApiResponse.ok(created, "Experience created"));
    }

    @PutMapping("/{experienceId}")
    @Operation(summary = "Replace an experience entry and reconcile its positions")
    public ResponseEntity<ApiResponse<ExperienceResponse>> update(@PathVariable Long profileId,
            @PathVariable Long experienceId, @Valid @RequestBody ExperienceRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(experienceService.update(profileId, experienceId, request), "Experience updated"));
    }

    @DeleteMapping("/{experienceId}")
    @Operation(summary = "Delete an experience entry and everything below it")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long profileId, @PathVariable Long experienceId) {
        experienceService.delete(profileId, experienceId);
        return ResponseEntity.ok(ApiResponse.empty("Experience deleted"));
    }

    @PatchMapping("/reorder")
    @Operation(summary = "Rewrite the display order across all experience entries")
    public ResponseEntity<ApiResponse<List<ExperienceResponse>>> reorder(@PathVariable Long profileId,
            @Valid @RequestBody ReorderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(experienceService.reorder(profileId, request), "Order updated"));
    }
}
