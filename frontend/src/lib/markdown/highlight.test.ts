// frontend/src/lib/markdown/highlight.test.ts
import { describe, expect, it } from 'vitest';
import { escapeHtml, highlightEscapedCode, normalizeLanguage } from '@/lib/markdown/highlight';

describe('escapeHtml', () => {
  it('escapes every HTML-significant character', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
  });

  it('escapes the ampersand first so entities are not double-decoded', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('plain text 123')).toBe('plain text 123');
  });
});

describe('normalizeLanguage', () => {
  it('takes the first token and lowercases it', () => {
    expect(normalizeLanguage('TS title="x"')).toBe('ts');
  });

  it('strips characters that are not CSS-class safe', () => {
    expect(normalizeLanguage('c++/js')).toBe('c++js');
  });

  it('returns an empty string when there is no info string', () => {
    expect(normalizeLanguage(undefined)).toBe('');
    expect(normalizeLanguage('')).toBe('');
  });
});

describe('highlightEscapedCode', () => {
  it('marks keywords', () => {
    expect(highlightEscapedCode('const x')).toContain('<span class="tok-key">const</span>');
  });

  it('marks numbers', () => {
    expect(highlightEscapedCode('x = 42')).toContain('<span class="tok-num">42</span>');
  });

  it('marks line comments', () => {
    expect(highlightEscapedCode('// note')).toContain('<span class="tok-com">// note</span>');
  });

  it('marks escaped double-quoted strings', () => {
    const result = highlightEscapedCode(escapeHtml('"const"'));
    expect(result).toContain('tok-str');
  });

  it('does not re-mark a keyword that sits inside a string', () => {
    const result = highlightEscapedCode(escapeHtml('"const"'));
    expect(result).not.toContain('tok-key');
  });

  it('leaves text with no tokens unchanged', () => {
    expect(highlightEscapedCode('plain words here')).toBe('plain words here');
  });
});
