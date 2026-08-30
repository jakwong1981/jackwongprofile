// backend/src/main/java/com/jackwong/profile/api/controller/AdminCertificationController.java
package com.jackwong.profile.api.controller;

import com.jackwong.profile.api.dto.request.CertificationRequest;
import com.jackwong.profile.api.dto.request.ReorderRequest;
import com.jackwong.profile.api.dto.response.CertificationResponse;
import com.jackwong.profile.common.api.ApiResponse;
import com.jackwong.profile.service.CertificationService;
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
 * Administrative CRUD over professional credentials.
 */
@RestController
@RequestMapping("/api/v1/admin/profiles/{profileId}/certifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin certification", description = "Authenticated credential maintenance")
public class AdminCertificationController {

    private final CertificationService certificationService;

    @GetMapping
    @Operation(summary = "List all credentials of a profile")
    public ResponseEntity<ApiResponse<List<CertificationResponse>>> list(@PathVariable Long profileId) {
        return ResponseEntity.ok(ApiResponse.ok(certificationService.listByProfile(profileId)));
    }

    @GetMapping("/{certificationId}")
    @Operation(summary = "Fetch one credential")
    public ResponseEntity<ApiResponse<CertificationResponse>> getById(@PathVariable Long profileId,
            @PathVariable Long certificationId) {
        return ResponseEntity.ok(ApiResponse.ok(certificationService.getById(profileId, certificationId)));
    }

    @PostMapping
    @Operation(summary = "Create a credential")
    public ResponseEntity<ApiResponse<CertificationResponse>> create(@PathVariable Long profileId,
            @Valid @RequestBody CertificationRequest request) {
        CertificationResponse created = certificationService.create(profileId, request);
        URI location = URI.create("/api/v1/admin/profiles/%d/certifications/%d".formatted(profileId, created.id()));
        return ResponseEntity.created(location).body(ApiResponse.ok(created, "Certification created"));
    }

    @PutMapping("/{certificationId}")
    @Operation(summary = "Replace a credential")
    public ResponseEntity<ApiResponse<CertificationResponse>> update(@PathVariable Long profileId,
            @PathVariable Long certificationId, @Valid @RequestBody CertificationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                certificationService.update(profileId, certificationId, request), "Certification updated"));
    }

    @DeleteMapping("/{certificationId}")
    @Operation(summary = "Delete a credential")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long profileId,
            @PathVariable Long certificationId) {
        certificationService.delete(profileId, certificationId);
        return ResponseEntity.ok(ApiResponse.empty("Certification deleted"));
    }

    @PatchMapping("/reorder")
    @Operation(summary = "Rewrite the display order across all credentials")
    public ResponseEntity<ApiResponse<List<CertificationResponse>>> reorder(@PathVariable Long profileId,
            @Valid @RequestBody ReorderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(certificationService.reorder(profileId, request), "Order updated"));
    }
}
