// backend/src/main/java/com/jackwong/profile/api/controller/AdminNewsController.java
package com.jackwong.profile.api.controller;

import com.jackwong.profile.api.dto.request.NewsIngestionRequest;
import com.jackwong.profile.api.dto.response.NewsArticleResponse;
import com.jackwong.profile.api.dto.response.NewsIngestionRunResponse;
import com.jackwong.profile.common.api.ApiResponse;
import com.jackwong.profile.config.NewsProperties;
import com.jackwong.profile.service.news.NewsAnalysisService;
import com.jackwong.profile.service.news.NewsIngestionService;
import com.jackwong.profile.service.news.NewsPersistenceService;
import com.jackwong.profile.service.news.NewsQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Operational control of the AI news aggregator: manual ingestion, re-analysis, and cleanup.
 */
@Validated
@RestController
@RequestMapping("/api/v1/admin/news")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin news", description = "Authenticated control of the news aggregator")
public class AdminNewsController {

    private final NewsIngestionService newsIngestionService;
    private final NewsAnalysisService newsAnalysisService;
    private final NewsQueryService newsQueryService;
    private final NewsPersistenceService newsPersistenceService;
    private final NewsProperties newsProperties;

    @PostMapping("/ingest")
    @Operation(summary = "Run one aggregation cycle immediately")
    public ResponseEntity<ApiResponse<NewsIngestionRunResponse>> ingest(
            @Valid @RequestBody(required = false) NewsIngestionRequest request, Principal principal) {
        NewsIngestionRequest safeRequest = request == null ? new NewsIngestionRequest(null, null) : request;
        boolean analyze = safeRequest.shouldAnalyze(newsProperties.ingestion().autoAnalyze());
        NewsIngestionRunResponse run =
                newsIngestionService.ingest(safeRequest.safeSourceKeys(), analyze, principal.getName());
        return ResponseEntity.ok(ApiResponse.ok(run, "Ingestion cycle completed"));
    }

    @PostMapping("/analyze")
    @Operation(summary = "Analyse the oldest still-pending articles")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> analyzePending(
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int limit) {
        int analyzed = newsAnalysisService.analyzePending(limit);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("analyzed", analyzed), "Analysis batch completed"));
    }

    @PostMapping("/{articleId}/analyze")
    @Operation(summary = "Re-run the analysis for one article")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> analyzeOne(@PathVariable Long articleId) {
        return ResponseEntity.ok(
                ApiResponse.ok(newsAnalysisService.analyzeById(articleId), "Analysis completed"));
    }

    @DeleteMapping("/{articleId}")
    @Operation(summary = "Delete one aggregated article")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long articleId) {
        newsPersistenceService.deleteArticle(articleId);
        return ResponseEntity.ok(ApiResponse.empty("Article deleted"));
    }

    @GetMapping("/runs")
    @Operation(summary = "List the most recent aggregation runs")
    public ResponseEntity<ApiResponse<List<NewsIngestionRunResponse>>> runs(
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int limit) {
        return ResponseEntity.ok(ApiResponse.ok(newsQueryService.recentRuns(limit)));
    }
}
