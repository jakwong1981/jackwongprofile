// backend/src/main/java/com/jackwong/profile/api/dto/request/ReorderRequest.java
package com.jackwong.profile.api.dto.request;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Reassigns {@code displayOrder} across sibling rows.
 *
 * @param orderedIds ids in their new display order; must cover the complete sibling set
 */
public record ReorderRequest(@NotEmpty(message = "orderedIds must not be empty") List<Long> orderedIds) {
}
