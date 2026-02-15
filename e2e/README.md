# End-to-End Test Suite

## Overview
Comprehensive E2E tests using Playwright to validate application behavior without requiring a live backend.

## Test Coverage

### 1. Homepage Tests (`e2e/homepage.spec.ts`)
- ✅ Page loads successfully
- ✅ Main content renders
- ✅ Post feed displays
- ✅ Navigation works

### 2. GraphQL Integration (`e2e/graphql.spec.ts`)
- ✅ AppSync connection handling
- ✅ Graceful error handling for missing backend
- ✅ Apollo Client configuration

### 3. Authentication & Routing (`e2e/auth-routing.spec.ts`)
- ✅ Authentication UI loads
- ✅ NextAuth API routes respond
- ✅ Subreddit routing works
- ✅ 404 handling

### 4. Build Validation (`e2e/build-validation.spec.ts`)
- ✅ Environment configuration valid
- ✅ No critical console errors
- ✅ Apollo Client initializes

### 5. UI & Performance (`e2e/ui-performance.spec.ts`)
- ✅ Main UI renders
- ✅ Responsive layout
- ✅ No hydration errors
- ✅ Load time < 10 seconds
- ✅ Navigation without memory leaks

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### With UI (Interactive)
```bash
npm run test:e2e:ui
```

### Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Full Validation Suite
```bash
npm run test:all
```
This runs: type-check → lint → build → e2e tests

## Test Philosophy

These tests validate:
1. **Build Integrity**: App builds and runs without crashes
2. **Error Resilience**: Graceful handling of missing backend/services
3. **Core Functionality**: Routing, navigation, and page rendering
4. **Performance**: Reasonable load times and no memory leaks
5. **Configuration**: Environment variables and client setup

## Expected Behavior

### Without Backend (Current State)
- ✅ App loads successfully
- ✅ UI renders correctly
- ⚠️ GraphQL queries fail gracefully (expected)
- ⚠️ EdgeStore errors logged (expected, optional service)
- ✅ No application crashes

### With Backend (After CDK Deploy)
- ✅ All above tests pass
- ✅ GraphQL queries succeed
- ✅ Data loads from DynamoDB
- ✅ Posts, comments, votes work

## CI/CD Integration

Add to `.github/workflows/test.yml`:
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E Tests
  run: npm run test:e2e
```

## Notes

- Tests are designed to pass even without a live backend
- Validates application structure and error handling
- Filters expected errors (AppSync 404, EdgeStore auth)
- Focuses on critical user paths and build integrity
