// frontend/src/lib/markdown/highlight.ts

/**
 * Escapes text so it can be embedded in HTML without being interpreted as markup.
 *
 * @param value raw text
 * @returns HTML-safe text
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Keywords shared across the languages this project actually writes. */
const KEYWORDS = [
  'abstract', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'def', 'default', 'delete', 'do', 'elif', 'else', 'enum', 'export', 'extends', 'false', 'final', 'finally',
  'for', 'from', 'function', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'new',
  'null', 'package', 'private', 'protected', 'public', 'record', 'return', 'select', 'static', 'super',
  'switch', 'this', 'throw', 'throws', 'true', 'try', 'type', 'typeof', 'var', 'void', 'while', 'yield',
];

/**
 * Single pass over already-escaped source. Alternation order matters: strings and
 * comments are captured first so a keyword inside a string is never re-marked.
 */
const TOKEN_PATTERN = new RegExp(
  [
    '(&quot;(?:[^&]|&(?!quot;))*?&quot;|&#39;(?:[^&]|&(?!#39;))*?&#39;|`[^`]*`)', // 1: strings
    '(\\/\\/[^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)', // 2: comments
    `\\b(${KEYWORDS.join('|')})\\b`, // 3: keywords
    '\\b(\\d+(?:\\.\\d+)?)\\b', // 4: numbers
  ].join('|'),
  'g',
);

/**
 * Lightweight, dependency-free syntax highlighting for fenced code blocks.
 * The input MUST already be HTML-escaped; only `<span>` wrappers are inserted.
 *
 * @param escapedCode HTML-escaped source text
 * @returns the same text with token spans inserted
 */
export function highlightEscapedCode(escapedCode: string): string {
  return escapedCode.replace(
    TOKEN_PATTERN,
    (match, str?: string, comment?: string, keyword?: string, num?: string): string => {
      if (str !== undefined) {
        return `<span class="tok-str">${str}</span>`;
      }
      if (comment !== undefined) {
        return `<span class="tok-com">${comment}</span>`;
      }
      if (keyword !== undefined) {
        return `<span class="tok-key">${keyword}</span>`;
      }
      if (num !== undefined) {
        return `<span class="tok-num">${num}</span>`;
      }
      return match;
    },
  );
}

/**
 * Normalises a fence info string into a CSS-safe language token.
 *
 * @param infoString the text after the opening fence, e.g. `ts title="x"`
 * @returns a lowercase `[a-z0-9+#-]` token, or an empty string
 */
export function normalizeLanguage(infoString: string | undefined): string {
  if (!infoString) {
    return '';
  }
  const first = infoString.trim().split(/\s+/)[0] ?? '';
  return first.toLowerCase().replace(/[^a-z0-9+#-]/g, '');
}
