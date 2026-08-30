// backend/src/main/java/com/jackwong/profile/service/news/fetcher/NewsFetcher.java
package com.jackwong.profile.service.news.fetcher;

import com.jackwong.profile.config.NewsProperties;
import java.util.List;

/**
 * Strategy for reading items from one configured source.
 */
public interface NewsFetcher {

    /**
     * @return the source type this fetcher handles
     */
    NewsProperties.SourceType supports();

    /**
     * Reads the most recent items from the source.
     *
     * @param source   source configuration
     * @param maxItems upper bound of items to return
     * @return newest-first items; never {@code null}
     * @throws com.jackwong.profile.common.exception.UpstreamServiceException when the source is unreachable
     */
    List<FetchedArticle> fetch(NewsProperties.Source source, int maxItems);
}
