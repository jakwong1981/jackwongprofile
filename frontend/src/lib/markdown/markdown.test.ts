// frontend/src/lib/markdown/markdown.test.ts
import { describe, expect, it } from 'vitest';
import { countMarkdown, renderMarkdown, safeUrl, toPlainText } from '@/lib/markdown';

describe('safeUrl', () => {
  it('accepts the allowed protocols', () => {
    expect(safeUrl('https://example.com')).toBe('https://example.com');
    expect(safeUrl('http://example.com')).toBe('http://example.com');
    expect(safeUrl('mailto:a@b.co')).toBe('mailto:a@b.co');
    expect(safeUrl('tel:+85212345678')).toBe('tel:+85212345678');
  });

  it('accepts root-relative and fragment links', () => {
    expect(safeUrl('/news')).toBe('/news');
    expect(safeUrl('#about')).toBe('#about');
  });

  it('rejects script-bearing and unknown protocols', () => {
    expect(safeUrl('javascript:alert(1)')).toBeNull();
    expect(safeUrl('data:text/html;base64,PHNjcmlwdD4=')).toBeNull();
    expect(safeUrl('vbscript:msgbox')).toBeNull();
  });

  it('rejects blank input', () => {
    expect(safeUrl('')).toBeNull();
    expect(safeUrl('   ')).toBeNull();
    expect(safeUrl(null)).toBeNull();
    expect(safeUrl(undefined)).toBeNull();
  });
});

describe('renderMarkdown', () => {
  it('returns an empty string for blank input', () => {
    expect(renderMarkdown('')).toBe('');
    expect(renderMarkdown('   \n  ')).toBe('');
    expect(renderMarkdown(null)).toBe('');
    expect(renderMarkdown(undefined)).toBe('');
  });

  it('renders GFM tables', () => {
    const html = renderMarkdown('| A | B |\n| - | - |\n| 1 | 2 |');
    expect(html).toContain('<table>');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>');
  });

  it('renders GFM task lists as checkboxes', () => {
    const html = renderMarkdown('- [x] shipped\n- [ ] pending');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('checked');
  });

  it('renders fenced code with a language label and highlight spans', () => {
    const html = renderMarkdown('```ts\nconst x = 1;\n```');
    expect(html).toContain('class="language-ts"');
    expect(html).toContain('<span class="code-lang">ts</span>');
    expect(html).toContain('tok-key');
  });

  it('escapes HTML inside fenced code rather than emitting it', () => {
    const html = renderMarkdown('```html\n<script>alert(1)</script>\n```');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('drops raw HTML blocks entirely', () => {
    const html = renderMarkdown('<img src=x onerror="alert(1)">\n\ntext');
    expect(html).not.toContain('onerror');
    expect(html).toContain('text');
  });

  it('strips javascript: links but keeps their text', () => {
    const html = renderMarkdown('[click](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('click');
  });

  it('marks external links as noopener', () => {
    const html = renderMarkdown('[site](https://example.com)');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it('does not add target to relative links', () => {
    const html = renderMarkdown('[news](/news)');
    expect(html).toContain('href="/news"');
    expect(html).not.toContain('target="_blank"');
  });

  it('drops images with an unsafe source but keeps the alt text', () => {
    const html = renderMarkdown('![shot](javascript:alert(1))');
    expect(html).not.toContain('<img');
    expect(html).toContain('shot');
  });
});

describe('toPlainText', () => {
  it('strips headings, emphasis, links, and code fences', () => {
    const source = '# Title\n\nSome **bold** and [a link](https://x.dev).\n\n```ts\ncode\n```';
    expect(toPlainText(source)).toBe('Title Some bold and a link.');
  });

  it('strips list and task-list markers', () => {
    expect(toPlainText('- [x] done\n- plain')).toBe('done plain');
  });

  it('ellipsises beyond the requested length', () => {
    const result = toPlainText('a'.repeat(300), 10);
    expect(result).toHaveLength(11);
    expect(result.endsWith('…')).toBe(true);
  });

  it('returns an empty string for absent input', () => {
    expect(toPlainText(null)).toBe('');
    expect(toPlainText(undefined)).toBe('');
  });
});

describe('countMarkdown', () => {
  it('counts characters, words, and lines', () => {
    expect(countMarkdown('hello world\nsecond line')).toEqual({
      characters: 23,
      words: 4,
      lines: 2,
    });
  });

  it('reports zero words and zero lines for an empty document', () => {
    expect(countMarkdown('')).toEqual({ characters: 0, words: 0, lines: 0 });
  });

  it('does not count whitespace-only content as a word', () => {
    expect(countMarkdown('   ').words).toBe(0);
  });
});
