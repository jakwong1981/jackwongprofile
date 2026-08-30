// backend/src/main/java/com/jackwong/profile/api/mapper/NewsMapper.java
package com.jackwong.profile.api.mapper;

import com.jackwong.profile.api.dto.response.NewsArticleResponse;
import com.jackwong.profile.api.dto.response.NewsIngestionRunResponse;
import com.jackwong.profile.domain.entity.NewsArticle;
import com.jackwong.profile.domain.entity.NewsIngestionRun;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * Entity -&gt; DTO translation for the AI news aggregator.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NewsMapper {

    NewsArticleResponse toResponse(NewsArticle article);

    List<NewsArticleResponse> toResponseList(List<NewsArticle> articles);

    NewsIngestionRunResponse toRunResponse(NewsIngestionRun run);
}
