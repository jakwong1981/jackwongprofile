// frontend/src/lib/utils/cn.ts

/**
 * Joins conditional class names, dropping falsy entries.
 *
 * @param values class name fragments
 * @returns a single space-separated class string
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');
}
