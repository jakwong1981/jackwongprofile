# Bugfix Requirements Document

## Introduction

The profile summary field in the API response displays as raw JSON string instead of properly parsed JSON object. When retrieving profile data through the public API endpoint, the summary field contains a JSON string within a JSON value (double-encoded JSON), causing frontend display issues where users see raw JSON text instead of properly formatted multilingual content.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the profile API endpoint returns a profile with summary field containing JSON data THEN the system displays the summary as a JSON string within the en field instead of a structured LocalizedText object

1.2 WHEN the LocalizedTextConverter reads summary_i18n data from the database that contains double-encoded JSON THEN the system fails to properly parse it into a LocalizedText object, resulting in the JSON string being stored in the en field

### Expected Behavior (Correct)

2.1 WHEN the profile API endpoint returns a profile with summary field THEN the system SHALL provide the summary as a properly structured LocalizedText JSON object with en, zhHant, and zhHans fields at the top level

2.2 WHEN the LocalizedTextConverter reads summary_i18n data from the database THEN the system SHALL correctly parse single JSON-encoded LocalizedText data into a LocalizedText object with separate language fields

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the profile API endpoint returns a profile without summary data THEN the system SHALL CONTINUE TO return null or empty LocalizedText object for the summary field

3.2 WHEN the LocalizedTextConverter reads plain text (non-JSON) data from legacy database rows THEN the system SHALL CONTINUE TO create a LocalizedText object with the text in the en field as fallback behavior

3.3 WHEN the profile API endpoint returns other LocalizedText fields (headline, jobTitle, localizedFullName) THEN the system SHALL CONTINUE TO provide them as properly structured JSON objects


## Bug Condition Derivation

### Bug Condition Function

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type ProfileSummaryData
  OUTPUT: boolean
  
  // Returns true when summary data contains double-encoded JSON
  // (JSON string stored as value of a JSON field)
  RETURN X.summary_i18n IS JSON string containing escaped JSON structure
END FUNCTION
```

### Property Specification

**Property: Fix Checking - Double JSON Encoding Handling**
```pascal
// F: Original (unfixed) function - returns JSON string in en field
// F': Fixed function - returns properly parsed LocalizedText object

FOR ALL X WHERE isBugCondition(X) DO
  result ← F'(X)
  ASSERT result.summary IS LocalizedText object WITH en, zhHant, zhHans fields
  ASSERT result.summary.en DOES NOT CONTAIN escaped JSON string
  ASSERT result.summary.zhHant IS string OR null
  ASSERT result.summary.zhHans IS string OR null
END FOR
```

**Property: Preservation Checking**
```pascal
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR
```

### Key Definitions

- **C(X)**: Bug Condition - summary_i18n contains double-encoded JSON (JSON string within JSON)
- **P(result)**: Property - result.summary is a proper LocalizedText object with language fields as strings (not JSON strings)
- **¬C(X)**: Non-buggy inputs - summary_i18n contains properly encoded JSON or plain text
- **F**: Original function - returns JSON string in en field when data is double-encoded
- **F'**: Fixed function - properly parses double-encoded JSON into LocalizedText object
- **Counterexample**: `{"summary":{"en":"{\"en\":\"text\",\"zhHant\":\"text\",\"zhHans\":\"text\"}"}}` instead of `{"summary":{"en":"text","zhHant":"text","zhHans":"text"}}`