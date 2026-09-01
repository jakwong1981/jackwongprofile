# Design: Fix Profile Service Unavailable Error

## Overview
Design solutions to fix the "Profile service could not be reached" error in SIT environment.

## Current Architecture
```
Frontend (Next.js) ──[SSR: http://backend:8080]──> Backend (Spring Boot)
      │                                            │
      └──[Browser: http://localhost:8080]─────────┘
```

## Problem Analysis

### Current Implementation Issues
1. **SSR Fetch Configuration**: Next.js-specific fetch options (`next: { revalidate }`) may cause issues
2. **Error Handling**: Errors are caught silently in `loadProfile()` function
3. **No Retry Logic**: Failed API calls don't retry
4. **No Debug Info**: No logging of actual error details

## Design Solutions

### Solution 1: Enhanced Error Logging
**Add detailed error logging to understand failure**
```typescript
async function loadProfile(): Promise<Profile | null> {
  try {
    return await profileApi.getPublicProfile(REVALIDATE_SECONDS);
  } catch (error) {
    console.error('Failed to load profile:', error);
    console.error('API URL used:', process.env.API_INTERNAL_BASE_URL);
    return null;
  }
}
```

### Solution 2: Simplified SSR Fetch
**Remove Next.js-specific options for SSR calls**
```typescript
// Option: Create separate SSR API client without Next.js options
export async function apiRequestSSR<T>(path: string): Promise<T> {
  const response = await fetch(`${process.env.API_INTERNAL_BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    // No Next.js-specific options
  });
  // ... rest of implementation
}
```

### Solution 3: Retry Logic
**Add retry with exponential backoff for transient failures**
```typescript
async function loadProfileWithRetry(): Promise<Profile | null> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await profileApi.getPublicProfile(REVALIDATE_SECONDS);
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error(`Final attempt failed:`, error);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
    }
  }
  return null;
}
```

### Solution 4: Environment Verification
**Add validation that environment variables are set correctly**
```typescript
function verifyEnvironment() {
  if (!process.env.API_INTERNAL_BASE_URL) {
    throw new Error('API_INTERNAL_BASE_URL environment variable is not set');
  }
  console.log('SSR API URL:', process.env.API_INTERNAL_BASE_URL);
}
```

## Recommended Approach
**Combine Solutions 1, 2, and 4:**
1. First add enhanced error logging (Solution 1) to understand the error
2. If error is related to fetch configuration, implement simplified SSR fetch (Solution 2)
3. Add environment verification (Solution 4) to ensure configuration is correct
4. If errors appear transient, add retry logic (Solution 3)

## Implementation Steps
1. **Phase 1: Diagnostics**
   - Add error logging to `loadProfile()`
   - Log environment variables during SSR
   - Test with simplified fetch

2. **Phase 2: Fix Implementation**
   - Implement chosen solution based on diagnostic results
   - Update API client configuration if needed

3. **Phase 3: Validation**
   - Test in SIT environment
   - Verify no error messages
   - Ensure profile data loads correctly

## Testing Strategy
- **Unit Tests**: Test error handling and retry logic
- **Integration Tests**: Test API calls in simulated SSR environment
- **End-to-End Tests**: Deploy to SIT and verify full flow works

## Rollback Plan
If fixes cause issues:
1. Revert to original implementation
2. Keep improved Docker health checks
3. Document findings for future debugging
