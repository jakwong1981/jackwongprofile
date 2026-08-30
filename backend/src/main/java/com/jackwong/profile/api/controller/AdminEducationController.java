// backend/src/main/java/com/jackwong/profile/api/controller/AdminEducationController.java
package com.jackwong.profile.api.controller;

import com.jackwong.profile.api.dto.request.EducationRequest;
import com.jackwong.profile.api.dto.request.ReorderRequest;
import com.jackwong.profile.api.dto.response.EducationResponse;
import com.jackwong.profile.common.api.ApiResponse;
import com.jackwong.profile.service.EducationService;
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
 * Administrative CRUD over academic records.
 */
@RestController
@RequestMapping("/api/v1/admin/profiles/{profileId}/educations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin education", description = "Authenticated academic-record maintenance")
public class AdminEducationController {

    private final EducationService educationService;

    @GetMapping
    @Operation(summary = "List all academic records of a profile")
    public ResponseEntity<ApiResponse<List<EducationResponse>>> list(@PathVariable Long profileId) {
        return ResponseEntity.ok(ApiResponse.ok(educationService.listByProfile(profileId)));
    }

    @GetMapping("/{educationId}")
    @Operation(summary = "Fetch one academic record")
    public ResponseEntity<ApiResponse<EducationResponse>> getById(@PathVariable Long profileId,
            @PathVariable Long educationId) {
        return ResponseEntity.ok(ApiResponse.ok(educationService.getById(profileId, educationId)));
    }

    @PostMapping
    @Operation(summary = "Create an academic record")
    public ResponseEntity<ApiResponse<EducationResponse>> create(@PathVariable Long profileId,
            @Valid @RequestBody EducationRequest request) {
        EducationResponse created = educationService.create(profileId, request);
        URI location = URI.create("/api/v1/admin/profiles/%d/educations/%d".formatted(profileId, created.id()));
        return ResponseEntity.created(location).body(ApiResponse.ok(created, "Education created"));
    }

    @PutMapping("/{educationId}")
    @Operation(summary = "Replace an academic record")
    public ResponseEntity<ApiResponse<EducationResponse>> update(@PathVariable Long profileId,
            @PathVariable Long educationId, @Valid @RequestBody EducationRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(educationService.update(profileId, educationId, request), "Education updated"));
    }

    @DeleteMapping("/{educationId}")
    @Operation(summary = "Delete an academic record")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long profileId, @PathVariable Long educationId) {
        educationService.delete(profileId, educationId);
        return ResponseEntity.ok(ApiResponse.empty("Education deleted"));
    }

    @PatchMapping("/reorder")
    @Operation(summary = "Rewrite the display order across all academic records")
    public ResponseEntity<ApiResponse<List<EducationResponse>>> reorder(@PathVariable Long profileId,
            @Valid @RequestBody ReorderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(educationService.reorder(profileId, request), "Order updated"));
    }
}
