// frontend/src/lib/markdown/index.ts
import { Marked } from 'marked';
import { escapeHtml, highlightEscapedCode, normalizeLanguage } from '@/lib/markdown/highlight';

/**
 * Protocols a link or image may use. Anything else (notably `javascript:`) is dropped,
 * which — together with raw HTML being discarded entirely — is what keeps the live
 * preview safe without pulling in a heavyweight sanitiser.
 */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * @param href candidate URL from the markdown source
 * @returns the URL when it is safe to emit, otherwise `null`
 */
export function safeUrl(href: string | null | undefined): string | null {
  if (!href) {
    return null;
  }
  const trimmed = href.trim();
  if (trimmed === '') {
    return null;
  }
  // Root-relative and fragment links carry no protocol and are always safe.
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed, 'https://placeholder.invalid');
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}

function buildParser(): Marked {
  const parser = new Marked({
    gfm: true,
    breaks: false,
    async: false,
  });

  parser.use({
    renderer: {
      // Raw HTML never survives into the output, so the rendered document only ever
      // contains markup that marked itself generated.
      html(): string {
        return '';
      },
      code(code: string, infostring: string | undefined): string {
        const language = normalizeLanguage(infostring);
        const highlighted = highlightEscapedCode(escapeHtml(code));
        const languageClass = language ? ` class="language-${language}"` : '';
        const label = language ? `<span class="code-lang">${escapeHtml(language)}</span>` : '';
        return `<div class="code-block">${label}<pre><code${languageClass}>${highlighted}</code></pre></div>`;
      },
      link(href: string, title: string | null | undefined, text: string): string {
        const url = safeUrl(href);
        if (url === null) {
          return text;
        }
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        const external = /^https?:/i.test(url);
        const relAttr = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeHtml(url)}"${titleAttr}${relAttr}>${text}</a>`;
      },
      image(href: string, title: string | null, text: string): string {
        const url = safeUrl(href);
        if (url === null) {
          return escapeHtml(text);
        }
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img src="${escapeHtml(url)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" />`;
      },
    },
  });

  return parser;
}

const parser = buildParser();

/**
 * Renders GitHub Flavored Markdown (tables, task lists, fenced code) to HTML.
 * Raw HTML in the source is discarded and unsafe URLs are stripped.
 *
 * @param markdown source text; `null`/`undefined` yields an empty string
 * @returns rendered HTML, safe to inject with `dangerouslySetInnerHTML`
 */
export function renderMarkdown(markdown: string | null | undefined): string {
  if (!markdown || markdown.trim() === '') {
    return '';
  }
  return parser.parse(markdown) as string;
}

/**
 * Strips markdown syntax down to readable text, for meta descriptions and previews.
 *
 * @param markdown source text
 * @param maxLength maximum number of characters to keep
 * @returns plain text, ellipsised when truncated
 */
export function toPlainText(markdown: string | null | undefined, maxLength = 200): string {
  if (!markdown) {
    return '';
  }
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+\[[ xX]\]\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length <= maxLength ? text : `${text.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Editor statistics shown under the markdown pane.
 *
 * @param markdown source text
 * @returns character, word, and line counts
 */
export function countMarkdown(markdown: string): { characters: number; words: number; lines: number } {
  const trimmed = markdown.trim();
  return {
    characters: markdown.length,
    words: trimmed === '' ? 0 : trimmed.split(/\s+/).length,
    lines: markdown === '' ? 0 : markdown.split('\n').length,
  };
}
