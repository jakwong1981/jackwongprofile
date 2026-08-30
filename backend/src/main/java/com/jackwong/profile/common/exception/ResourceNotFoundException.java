// backend/src/main/java/com/jackwong/profile/common/exception/ResourceNotFoundException.java
package com.jackwong.profile.common.exception;

import com.jackwong.profile.common.api.ErrorCode;

/**
 * Raised when an addressed aggregate or entity does not exist.
 */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resource, Object identifier) {
        super(ErrorCode.RESOURCE_NOT_FOUND, "%s [%s] was not found".formatted(resource, identifier));
    }

    public ResourceNotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message);
    }
}
