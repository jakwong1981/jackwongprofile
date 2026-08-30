// backend/src/main/java/com/jackwong/profile/service/AuthService.java
package com.jackwong.profile.service;

import com.jackwong.profile.api.dto.request.LoginRequest;
import com.jackwong.profile.api.dto.request.RefreshTokenRequest;
import com.jackwong.profile.api.dto.response.AdminUserResponse;
import com.jackwong.profile.api.dto.response.AuthTokenResponse;
import com.jackwong.profile.api.mapper.AdminUserMapper;
import com.jackwong.profile.common.api.ErrorCode;
import com.jackwong.profile.common.exception.BusinessException;
import com.jackwong.profile.domain.entity.AdminUser;
import com.jackwong.profile.repository.AdminUserRepository;
import com.jackwong.profile.security.JwtService;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Sign-in, token refresh, and current-operator lookup for the administrative portal.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final AuthenticationManager authenticationManager;
    private final AdminUserRepository adminUserRepository;
    private final AdminUserMapper adminUserMapper;
    private final JwtService jwtService;

    /**
     * Verifies the credentials and mints an access / refresh token pair.
     *
     * @param request validated sign-in payload
     * @return the issued tokens together with the operator projection
     * @throws BusinessException with {@link ErrorCode#INVALID_CREDENTIALS} on any failure
     */
    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public AuthTokenResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (AuthenticationException ex) {
            log.warn("Failed sign-in attempt for username='{}': {}", request.username(), ex.getMessage());
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS,
                    ErrorCode.INVALID_CREDENTIALS.getDefaultMessage());
        }

        AdminUser adminUser = adminUserRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS,
                        ErrorCode.INVALID_CREDENTIALS.getDefaultMessage()));
        adminUser.setLastLoginAt(Instant.now());
        log.info("Administrator '{}' signed in", adminUser.getUsername());
        return issueTokens(adminUser);
    }

    /**
     * Exchanges a valid refresh token for a fresh token pair.
     *
     * @param request refresh payload
     * @return the newly issued tokens
     */
    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public AuthTokenResponse refresh(RefreshTokenRequest request) {
        String username = jwtService.extractRefreshSubject(request.refreshToken())
                .orElseThrow(() -> new BusinessException(ErrorCode.TOKEN_EXPIRED,
                        "Refresh token is invalid or has expired"));
        AdminUser adminUser = adminUserRepository.findByUsername(username)
                .filter(AdminUser::isEnabled)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Account is no longer active"));
        return issueTokens(adminUser);
    }

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public AdminUserResponse currentUser(String username) {
        return adminUserRepository.findByUsername(username)
                .map(adminUserMapper::toResponse)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Account is no longer active"));
    }

    private AuthTokenResponse issueTokens(AdminUser adminUser) {
        return new AuthTokenResponse(
                jwtService.issueAccessToken(adminUser.getUsername()),
                jwtService.issueRefreshToken(adminUser.getUsername()),
                TOKEN_TYPE,
                jwtService.accessTokenTtlSeconds(),
                adminUserMapper.toResponse(adminUser));
    }
}
