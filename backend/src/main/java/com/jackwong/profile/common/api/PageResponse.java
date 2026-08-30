// backend/src/main/java/com/jackwong/profile/common/api/PageResponse.java
package com.jackwong.profile.common.api;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 * Transport friendly projection of a Spring Data {@link Page}.
 *
 * @param items      page content
 * @param page       zero based page index
 * @param size       requested page size
 * @param totalItems total number of matching rows
 * @param totalPages total number of pages
 * @param <T>        item type
 */
public record PageResponse<T>(List<T> items, int page, int size, long totalItems, int totalPages) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(),
                page.getTotalPages());
    }
}
