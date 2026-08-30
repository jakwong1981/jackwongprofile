// backend/src/main/java/com/jackwong/profile/service/news/fetcher/HtmlNewsFetcher.java
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
import org.springframework.stereotype.Component;

/**
 * Scrapes an HTML index page for sources that publish no machine readable feed
 * (The Rundown AI, The Batch, Hugging Face Daily Papers). Selectors come from configuration
 * so a markup change is a YAML edit rather than a redeploy of new code.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HtmlNewsFetcher implements NewsFetcher {

    /** Sentinel meaning "the matched element itself carries the value". */
    private static final String SELF = "self";

    private static final int MIN_TITLE_LENGTH = 12;

    private final NewsProperties newsProperties;

    @Override
    public NewsProperties.SourceType supports() {
        return NewsProperties.SourceType.HTML;
    }

    @Override
    public List<FetchedArticle> fetch(NewsProperties.Source source, int maxItems) {
        if (source.itemSelector() == null || source.itemSelector().isBlank()) {
            throw new UpstreamServiceException(
                    "HTML source %s is missing an item-selector".formatted(source.key()));
        }

        Document document = load(source);
        List<FetchedArticle> articles = new ArrayList<>();
        Set<String> seenUrls = new LinkedHashSet<>();

        for (Element item : document.select(source.itemSelector())) {
            if (articles.size() >= maxItems) {
                break;
            }
            String title = extractText(item, source.titleSelector());
            String link = extractLink(item, source.linkSelector());
            if (title.length() < MIN_TITLE_LENGTH || link.isBlank() || !seenUrls.add(link)) {
                continue;
            }
            articles.add(new FetchedArticle(
                    truncate(title, 500),
                    truncate(link, 1000),
                    null,
                    null,
                    null));
        }

        log.debug("Scraped {} items from HTML source {}", articles.size(), source.key());
        return articles;
    }

    private Document load(NewsProperties.Source source) {
        try {
            return Jsoup.connect(source.feedUrl())
                    .userAgent(newsProperties.ingestion().userAgent())
                    .timeout(newsProperties.ingestion().requestTimeoutMs())
                    .followRedirects(true)
                    .get();
        } catch (IOException ex) {
            throw new UpstreamServiceException(
                    "Unable to read page %s: %s".formatted(source.feedUrl(), ex.getMessage()), ex);
        }
    }

    private String extractText(Element item, String selector) {
        if (selector == null || selector.isBlank() || SELF.equalsIgnoreCase(selector)) {
            return item.text().trim();
        }
        Element found = item.selectFirst(selector);
        return found == null ? "" : found.text().trim();
    }

    private String extractLink(Element item, String selector) {
        Element target = (selector == null || selector.isBlank() || SELF.equalsIgnoreCase(selector))
                ? item
                : item.selectFirst(selector);
        if (target == null) {
            return "";
        }
        // absUrl resolves against the document base URI, turning "/papers/2401" into a full URL.
        String absolute = target.absUrl("href");
        return absolute.isBlank() ? target.attr("href").trim() : absolute;
    }

    private String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }
}
