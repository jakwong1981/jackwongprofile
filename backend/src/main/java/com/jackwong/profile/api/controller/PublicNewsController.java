// backend/src/main/java/com/jackwong/profile/api/controller/PublicNewsController.java
package com.jackwong.profile.api.controller;

import com.jackwong.profile.api.dto.response.NewsArticleResponse;
import com.jackwong.profile.api.dto.response.NewsStatsResponse;
import com.jackwong.profile.common.api.ApiResponse;
import com.jackwong.profile.common.api.PageResponse;
import com.jackwong.profile.domain.entity.AnalysisStatus;
import com.jackwong.profile.service.news.NewsQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Unauthenticated read access to the AI news aggregator dashboard.
 */
@Validated
@RestController
@RequestMapping("/api/v1/public/news")
@RequiredArgsConstructor
@Tag(name = "Public news", description = "Aggregated AI news with DeepSeek enrichment")
public class PublicNewsController {

    private final NewsQueryService newsQueryService;

    @GetMapping
    @Operation(summary = "Search aggregated news articles")
    public ResponseEntity<ApiResponse<PageResponse<NewsArticleResponse>>> search(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) AnalysisStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(
                ApiResponse.ok(newsQueryService.search(source, category, status, keyword, from, to, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Fetch one aggregated article")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(newsQueryService.getById(id)));
    }

    @GetMapping("/stats")
    @Operation(summary = "Dashboard counters, configured sources, and the latest ingestion run")
    public ResponseEntity<ApiResponse<NewsStatsResponse>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(newsQueryService.stats()));
    }
}
