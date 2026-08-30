// backend/src/main/java/com/jackwong/profile/security/RestAccessDeniedHandler.java
package com.jackwong.profile.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jackwong.profile.common.api.ApiResponse;
import com.jackwong.profile.common.api.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

/**
 * Renders authorisation failures in the standard {@link ApiResponse} envelope.
 */
@Component
@RequiredArgsConstructor
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {
        response.setStatus(ErrorCode.FORBIDDEN.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(),
                ApiResponse.error(ErrorCode.FORBIDDEN, ErrorCode.FORBIDDEN.getDefaultMessage()));
    }
}
