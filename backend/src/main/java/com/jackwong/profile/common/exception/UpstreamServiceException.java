// backend/src/main/java/com/jackwong/profile/common/exception/UpstreamServiceException.java
package com.jackwong.profile.common.exception;

import com.jackwong.profile.common.api.ErrorCode;

/**
 * Raised when an outbound dependency (DeepSeek API, news source) fails or is disabled.
 */
public class UpstreamServiceException extends BusinessException {

    public UpstreamServiceException(String message) {
        super(ErrorCode.UPSTREAM_UNAVAILABLE, message);
    }

    public UpstreamServiceException(String message, Throwable cause) {
        super(ErrorCode.UPSTREAM_UNAVAILABLE, message, cause);
    }
}
