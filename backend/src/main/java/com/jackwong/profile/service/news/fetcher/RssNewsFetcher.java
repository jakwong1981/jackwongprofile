// backend/src/main/java/com/jackwong/profile/service/news/fetcher/RssNewsFetcher.java
package com.jackwong.profile.service.news.fetcher;

import com.jackwong.profile.common.exception.UpstreamServiceException;
import com.jackwong.profile.config.NewsProperties;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Parser;
import org.springframework.stereotype.Component;

/**
 * Reads RSS 2.0 and Atom feeds. Both dialects are handled by the same selector set so a
 * source can switch format without a configuration change.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RssNewsFetcher implements NewsFetcher {

    private final NewsProperties newsProperties;

    @Override
    public NewsProperties.SourceType supports() {
        return NewsProperties.SourceType.RSS;
    }

    @Override
    public List<FetchedArticle> fetch(NewsProperties.Source source, int maxItems) {
        Document document = load(source);
        List<FetchedArticle> articles = new ArrayList<>();
        Set<String> seenUrls = new LinkedHashSet<>();

        for (Element item : document.select("item, entry")) {
            if (articles.size() >= maxItems) {
                break;
            }
            String title = firstText(item, "title");
            String link = resolveLink(item);
            if (title.isBlank() || link.isBlank() || !seenUrls.add(link)) {
                continue;
            }
            articles.add(new FetchedArticle(
                    truncate(title, 500),
                    truncate(link, 1000),
                    emptyToNull(truncate(firstText(item, "dc|creator, author > name, author"), 160)),
                    FeedDateParser.parse(firstText(item, "pubDate, published, updated, dc|date")).orElse(null),
                    emptyToNull(truncate(firstText(item, "description, summary, content"), 4000))));
        }

        log.debug("Fetched {} items from RSS source {}", articles.size(), source.key());
        return articles;
    }

    private Document load(NewsProperties.Source source) {
        try {
            return Jsoup.connect(source.feedUrl())
                    .userAgent(newsProperties.ingestion().userAgent())
                    .timeout(newsProperties.ingestion().requestTimeoutMs())
                    .ignoreContentType(true)
                    .parser(Parser.xmlParser())
                    .get();
        } catch (IOException ex) {
            throw new UpstreamServiceException(
                    "Unable to read feed %s: %s".formatted(source.feedUrl(), ex.getMessage()), ex);
        }
    }

    /** RSS carries the URL as element text, Atom as a {@code href} attribute. */
    private String resolveLink(Element item) {
        Element link = item.selectFirst("link");
        if (link == null) {
            return "";
        }
        String href = link.attr("href");
        return href.isBlank() ? link.text().trim() : href.trim();
    }

    private String firstText(Element item, String selector) {
        Element found = item.selectFirst(selector);
        return found == null ? "" : found.text().trim();
    }

    private String truncate(String value, int max) {
        if (value == null) {
            return "";
        }
        return value.length() <= max ? value : value.substring(0, max);
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
