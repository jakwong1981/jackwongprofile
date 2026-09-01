# Profile Summary JSON Display Bugfix Design

## Overview

This bugfix addresses an issue where the profile summary field in API responses displays as raw JSON instead of properly parsed text. The summary field contains double-encoded JSON data, where a JSON string is stored as the value of the "en" field within another JSON object. This causes frontend display issues where users see escaped JSON text instead of formatted multilingual content. The fix involves ensuring proper JSON parsing in the `LocalizedTextConverter` and preventing double-encoding in the data flow.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when summary_i18n database column contains double-encoded JSON (JSON string within JSON)
- **Property (P)**: The desired behavior when double-encoded JSON is encountered - the system should properly parse it into a LocalizedText object with string language fields
- **Preservation**: Existing behavior for properly encoded JSON and plain text data must remain unchanged
- **LocalizedTextConverter**: The JPA converter in `com.jackwong.profile.domain.converter.LocalizedTextConverter` that handles JSON persistence for multilingual text
- **LocalizedText**: The value object in `com.jackwong.profile.domain.vo.LocalizedText` representing multilingual text with en, zhHant, zhHans fields
- **summary_i18n**: The database column in the profile table storing JSON-encoded LocalizedText data

## Bug Details

### Bug Condition

The bug manifests when the `LocalizedTextConverter` reads summary_i18n data from the database that contains double-encoded JSON. The converter's fallback mechanism treats JSON parsing failures as plain text, but when the database already contains a JSON string (not a JSON object), this results in that JSON string being assigned to the "en" field of a new LocalizedText object, creating double-encoded JSON in the API response.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type String (database column value)
  OUTPUT: boolean
  
  // Returns true when the input is a JSON string containing escaped JSON structure
  // Example: "{\"en\":\"text\",\"zhHant\":\"text\",\"zhHans\":\"text\"}"
  // This should be parsed as JSON object, not treated as plain text string
  RETURN input STARTS WITH '"' AND input ENDS WITH '"' 
         AND input CONTAINS escaped JSON structure (\"en\":)
         AND JSON.parse(input) IS VALID JSON object
END FUNCTION
```

### Examples

- **Example 1 (Bug Manifestation)**: Database contains `"{\"en\":\"I design and ship...\",\"zhHant\":\"我專注於...\",\"zhHans\":\"我专注于...\"}"` as a string. The converter fails to parse it as JSON (throws JsonProcessingException), falls back to plain text, creates LocalizedText with en=`"{\"en\":\"I design and ship...\",\"zhHant\":\"我專注於...\",\"zhHans\":\"我专注于...\"}"`. API returns `{"summary":{"en":"{\"en\":\"I design and ship...\",\"zhHant\":\"我專注於...\",\"zhHans\":\"我专注于...\"}"}}`

- **Example 2 (Expected Behavior)**: Database contains `{"en":"I design and ship...","zhHant":"我專注於...","zhHans":"我专注于..."}` as JSON. The converter successfully parses it into LocalizedText object. API returns `{"summary":{"en":"I design and ship...","zhHant":"我專注於...","zhHans":"我专注于..."}}`

- **Example 3 (Plain Text Fallback)**: Database contains `"Plain text summary"` as string. The converter fails JSON parsing, falls back to plain text, creates LocalizedText with en=`"Plain text summary"`. API returns `{"summary":{"en":"Plain text summary"}}` (correct fallback behavior)

- **Example 4 (Edge Case)**: Database contains `null` or empty string. The converter returns `null`. API returns `{"summary":null}` (correct behavior)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Properly encoded JSON data in summary_i18n must continue to be parsed correctly into LocalizedText objects
- Plain text (non-JSON) data in legacy rows must continue to use the fallback mechanism (assigned to en field)
- Null or empty database values must continue to return null
- Other LocalizedText fields (headline_i18n, job_title_i18n, full_name_i18n) must remain unaffected
- The converter's logging of fallback cases must continue for monitoring

**Scope:**
All inputs that do NOT involve double-encoded JSON strings should be completely unaffected by this fix. This includes:
- Properly formatted JSON objects in database columns
- Plain text strings (legacy data)
- Null or empty database values
- Other LocalizedText fields using the same converter

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Database Data Issue**: The summary_i18n column may contain JSON strings (with quotes) instead of JSON objects. This could happen if:
   - Data was inserted with extra string escaping
   - Migration or data import incorrectly formatted the JSON
   - Application code double-encoded JSON during save operations

2. **Converter Parsing Issue**: The `LocalizedTextConverter.convertToEntityAttribute` method's fallback mechanism may be too broad:
   - When `MAPPER.readValue()` fails with JsonProcessingException for any reason, it falls back to plain text
   - If the string is valid JSON (but as a string, not an object), it should attempt to unescape and parse it
   - The current fallback treats all parsing failures identically

3. **Data Flow Issue**: Somewhere in the save/update flow, LocalizedText objects might be getting serialized to JSON strings, and those strings are being saved to the database instead of the JSON objects.

4. **Character Encoding Issue**: The JSON might contain special characters or line breaks that cause parsing to fail, triggering the fallback incorrectly.

## Correctness Properties

Property 1: Bug Condition - Double-Encoded JSON Parsing

_For any_ database input where the summary_i18n column contains a double-encoded JSON string (valid JSON object stored as a string), the fixed LocalizedTextConverter SHALL properly parse it into a LocalizedText object with string values in en, zhHant, and zhHans fields, eliminating the double encoding in API responses.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Existing Behavior Maintenance

_For any_ database input where the summary_i18n column does NOT contain double-encoded JSON (proper JSON objects, plain text, or null), the fixed LocalizedTextConverter SHALL produce exactly the same behavior as the original converter, preserving all existing functionality for non-double-encoded data.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `/Users/wongchimanjack/github/full_stack_profiles/jackwongprofile/backend/src/main/java/com/jackwong/profile/domain/converter/LocalizedTextConverter.java`

**Function**: `convertToEntityAttribute(String dbData)`

**Specific Changes**:
1. **Enhanced JSON Parsing**: Modify the fallback logic to detect when the string is a JSON string (starts and ends with quotes) and attempt to unescape and parse it
2. **Better Error Diagnostics**: Improve logging to distinguish between different types of parsing failures
3. **Multi-Stage Parsing Attempt**: Attempt parsing in stages: first as JSON object, then as JSON string, then as plain text
4. **Data Validation**: Add validation to ensure saved data is properly formatted JSON, not JSON strings

**Implementation Details**:
```java
@Override
public LocalizedText convertToEntityAttribute(String dbData) {
    if (dbData == null || dbData.isBlank()) {
        return null;
    }
    try {
        // First attempt: parse as JSON object directly
        return MAPPER.readValue(dbData, LocalizedText.class);
    } catch (JsonProcessingException ex) {
        // Second attempt: check if it's a JSON string (starts and ends with quotes)
        String trimmed = dbData.trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            try {
                // Unescape the JSON string and parse it
                String unescaped = MAPPER.readValue(trimmed, String.class);
                return MAPPER.readValue(unescaped, LocalizedText.class);
            } catch (JsonProcessingException innerEx) {
                // If unescaping fails, log and fall through to plain text
                log.warn("Failed to parse JSON string in LocalizedText, falling back to plain text: {}",
                        dbData.substring(0, Math.min(32, dbData.length())));
            }
        }
        // Final fallback: treat as plain text (legacy behavior)
        log.warn("Falling back to plain-text LocalizedText for value starting with '{}'",
                dbData.substring(0, Math.min(32, dbData.length())));
        return LocalizedText.of(dbData);
    }
}
```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate database values with double-encoded JSON and assert that the converter produces proper LocalizedText objects. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Double-Encoded JSON Test**: Test with `"{\"en\":\"text\",\"zhHant\":\"text\",\"zhHans\":\"text\"}"` (will fail on unfixed code)
2. **Proper JSON Test**: Test with `{"en":"text","zhHant":"text","zhHans":"text"}` (should pass on unfixed code)
3. **Plain Text Test**: Test with `"Plain text"` (should pass on unfixed code)
4. **Null/Empty Test**: Test with `null` and `""` (should pass on unfixed code)

**Expected Counterexamples**:
- Double-encoded JSON inputs produce LocalizedText with JSON string in en field
- Possible causes: converter fallback treating JSON strings as plain text

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := LocalizedTextConverter_fixed.convertToEntityAttribute(input)
  ASSERT result IS LocalizedText object
  ASSERT result.en IS string AND NOT CONTAINS escaped JSON
  ASSERT result.zhHant IS string OR null
  ASSERT result.zhHans IS string OR null
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT LocalizedTextConverter_original(input) = LocalizedTextConverter_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for proper JSON and plain text, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Proper JSON Preservation**: Verify properly formatted JSON continues to parse correctly after fix
2. **Plain Text Preservation**: Verify plain text strings continue to use fallback mechanism after fix
3. **Null/Empty Preservation**: Verify null/empty handling remains unchanged after fix
4. **Special Character Preservation**: Verify JSON with special characters/newlines continues to work

### Unit Tests

- Test LocalizedTextConverter with various input types (double-encoded JSON, proper JSON, plain text, null)
- Test edge cases (empty strings, whitespace-only strings, malformed JSON)
- Test that logging still occurs for fallback cases
- Test round-trip conversion (toDatabaseColumn -> fromDatabaseColumn)

### Property-Based Tests

- Generate random LocalizedText objects, convert to JSON, test round-trip preservation
- Generate random strings and test converter behavior consistency
- Test that converter is idempotent for properly formatted JSON
- Test special character handling across many scenarios

### Integration Tests

- Test full API flow: retrieve profile with double-encoded JSON in database
- Test that frontend receives properly parsed JSON (not escaped strings)
- Test data migration scenarios (if data cleanup is needed)
- Test that other LocalizedText fields remain unaffected