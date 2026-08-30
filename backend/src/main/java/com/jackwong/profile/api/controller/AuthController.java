// backend/src/main/java/com/jackwong/profile/api/controller/AuthController.java
package com.jackwong.profile.api.controller;

import com.jackwong.profile.api.dto.request.LoginRequest;
import com.jackwong.profile.api.dto.request.RefreshTokenRequest;
import com.jackwong.profile.api.dto.response.AdminUserResponse;
import com.jackwong.profile.api.dto.response.AuthTokenResponse;
import com.jackwong.profile.common.api.ApiResponse;
import com.jackwong.profile.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sign-in and token lifecycle for the administrative portal.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Administrator sign-in and token refresh")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Exchange username and password for an access / refresh token pair")
    public ResponseEntity<ApiResponse<AuthTokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request), "Signed in"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a refresh token for a new access token")
    public ResponseEntity<ApiResponse<AuthTokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.refresh(request), "Token refreshed"));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Return the currently authenticated administrator")
    public ResponseEntity<ApiResponse<AdminUserResponse>> me(Principal principal) {
        return ResponseEntity.ok(ApiResponse.ok(authService.currentUser(principal.getName())));
    }
}
