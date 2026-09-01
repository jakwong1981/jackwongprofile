# Tasks: Fix Profile Service Unavailable Error

## Task 1: Add Diagnostic Error Logging
**Goal:** Understand what error is occurring during SSR
**Files:**
- `frontend/src/app/(site)/page.tsx` - Update `loadProfile()` function
- `frontend/src/lib/api/client.ts` - Add debug logging to `apiRequest()`

**Implementation:**
```typescript
// In frontend/src/app/(site)/page.tsx
async function loadProfile(): Promise<Profile | null> {
  try {
    console.log('SSR: Loading profile from:', process.env.API_INTERNAL_BASE_URL);
    const result = await profileApi.getPublicProfile(REVALIDATE_SECONDS);
    console.log('SSR: Profile loaded successfully');
    return result;
  } catch (error) {
    console.error('SSR: Failed to load profile:', error);
    console.error('SSR: Error details:', {
      message: error.message,
      stack: error.stack,
      apiUrl: process.env.API_INTERNAL_BASE_URL
    });
    return null;
  }
}
```

**Acceptance Criteria:**
- [ ] Error details logged to console during SSR
- [ ] Can identify exact error type and message
- [ ] Environment variables logged correctly

## Task 2: Create Simplified SSR API Client
**Goal:** Test if Next.js-specific fetch options are causing issues
**Files:**
- `frontend/src/lib/api/ssr-client.ts` - New file for SSR-specific API client
- `frontend/src/app/(site)/page.tsx` - Use SSR client for profile loading

**Implementation:**
```typescript
// frontend/src/lib/api/ssr-client.ts
export async function apiRequestSSR<T>(path: string): Promise<T> {
  const baseUrl = process.env.API_INTERNAL_BASE_URL ?? 'http://backend:8080/api/v1';
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;
  
  console.log('SSR API call to:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    // No Next.js-specific options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    if (json.code !== 200) {
      throw new Error(`API error ${json.code}: ${json.message}`);
    }
    return json.data as T;
  } catch (err) {
    throw new Error(`Failed to parse API response: ${err.message}`);
  }
}

// Export SSR-specific profile API
export const profileApiSSR = {
  getPublicProfile: (): Promise<Profile> => 
    apiRequestSSR<Profile>('/public/profile')
};
```

**Acceptance Criteria:**
- [ ] SSR client created without Next.js-specific options
- [ ] Profile page uses SSR client for loading
- [ ] API calls succeed during SSR
- [ ] Profile data displays correctly

## Task 3: Verify Environment Configuration
**Goal:** Ensure environment variables are set correctly during SSR
**Files:**
- `docker-compose.sit.yml` - Verify environment variable configuration
- `frontend/src/lib/api/client.ts` - Add environment validation

**Implementation:**
```typescript
// Add to frontend/src/lib/api/client.ts
function validateEnvironment() {
  if (typeof window === 'undefined') {
    // SSR context
    if (!process.env.API_INTERNAL_BASE_URL) {
      console.warn('API_INTERNAL_BASE_URL is not set during SSR');
    } else {
      console.log('SSR API URL:', process.env.API_INTERNAL_BASE_URL);
    }
  } else {
    // Browser context
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.warn('NEXT_PUBLIC_API_BASE_URL is not set in browser');
    }
  }
}

// Call at module level
validateEnvironment();
```

**Acceptance Criteria:**
- [ ] Environment variables validated during SSR
- [ ] Warnings logged if configuration is missing
- [ ] Configuration confirmed correct

## Task 4: Implement Retry Logic (If Needed)
**Goal:** Handle transient failures during startup
**Files:**
- `frontend/src/app/(site)/page.tsx` - Add retry logic to `loadProfile()`

**Implementation (conditional on diagnostic results):**
```typescript
async function loadProfileWithRetry(maxRetries = 3): Promise<Profile | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} to load profile`);
      return await profileApi.getPublicProfile(REVALIDATE_SECONDS);
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('All attempts failed');
        return null;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * Math.pow(2, attempt - 1);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
}
```

**Acceptance Criteria:**
- [ ] Retry logic implemented if diagnostics show transient failures
- [ ] Exponential backoff between retries
- [ ] Final failure logged clearly

## Task 5: Update Deployment Documentation
**Goal:** Document the fix and prevention measures
**Files:**
- `DEPLOYMENT_GUIDE.md` - Add troubleshooting section
- `README.md` - Update setup instructions

**Implementation:**
Add to DEPLOYMENT_GUIDE.md:
```markdown
### Issue: "Profile Service Could Not Be Reached"
**Symptoms:** Frontend shows error message even though backend API works
**Root Cause:** Next.js SSR fetch configuration issues with Docker networking
**Fix:** 
1. Use separate API client for SSR without Next.js-specific options
2. Ensure `API_INTERNAL_BASE_URL` is set correctly in Docker environment
3. Add retry logic for transient failures during startup
```

**Acceptance Criteria:**
- [ ] Documentation updated with troubleshooting steps
- [ ] Prevention measures documented
- [ ] Deployment guide includes configuration verification

## Testing Plan
1. **Local Testing:** Test changes in development environment
2. **SIT Testing:** Deploy to SIT environment and verify fix
3. **Validation:** Run `./scripts/validate-deployment.sh` to confirm all checks pass
4. **Browser Test:** Access http://localhost:3000 and verify profile loads

## Success Metrics
- [ ] Main page loads profile data without errors
- [ ] SSR API calls succeed consistently
- [ ] Error logging provides useful diagnostic information
- [ ] Deployment validation script passes all checks
