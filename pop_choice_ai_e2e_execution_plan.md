# E2E Test Automation Plan: BrowserBase + Stagehand for Pop Choice AI

## Context

The Pop Choice AI app currently has comprehensive E2E test scenarios documented in `E2E_testing_scenarios.md` (11 scenario groups covering single user flow, multi-user flow, poster display, error handling, performance, etc.), but no automated test infrastructure exists. This plan implements BrowserBase and Stagehand to automate these test scenarios, enabling reliable regression testing and faster validation of the frontend-to-backend integration with the deployed Cloudflare Worker.

**Why BrowserBase + Stagehand:**
- AI-powered browser automation using natural language (resilient to UI changes)
- Cloud-based browsers eliminate local environment issues
- Natural test descriptions align well with the existing E2E_testing_scenarios.md document

**Current State:**
- No test frameworks installed (no Jest, Vitest, Playwright, Cypress)
- React 19.2.1 + Vite + Tailwind CSS frontend
- Backend: Cloudflare Worker at `https://pop-choice-worker.hawitrial.workers.dev/`
- Tests must validate real backend integration, TMDB API poster fetching

## Implementation Plan

### Phase 1: Setup and Configuration

#### 1.1 Install Dependencies

```bash
npm install --save-dev @browserbasehq/stagehand vitest @vitest/ui dotenv
```

**Critical files to create:**

**`.env.test`** - Test environment configuration:
```env
# BrowserBase Configuration
BROWSERBASE_API_KEY=<your_browserbase_api_key>
BROWSERBASE_PROJECT_ID=<your_browserbase_project_id>

# LLM Provider for Stagehand
ANTHROPIC_API_KEY=<your_anthropic_api_key>

# Application Under Test
TEST_APP_URL=http://localhost:5173

# APIs
VITE_THEMOVIEDB_API_KEY=<your_tmdb_api_key>
CLOUDFLARE_WORKER_URL=https://pop-choice-worker.hawitrial.workers.dev/
```

#### 1.2 Configure Vitest

**Create `vitest.config.js`:**
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    testTimeout: 60000, // 60s for E2E tests with real backend
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist'],
    reporters: ['verbose', 'html']
  }
});
```

#### 1.3 Update package.json Scripts

Add to existing scripts:
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:e2e": "vitest run tests/e2e",
  "test:p0": "vitest run tests/e2e/critical",
  "test:p1": "vitest run tests/e2e/high",
  "test:p2": "vitest run tests/e2e/medium"
}
```

#### 1.4 Update .gitignore

Add:
```
.env.test
test-results/
coverage/
html/
```

### Phase 2: Test Infrastructure

#### 2.1 Create Directory Structure

```
tests/
├── setup.js                                  # Global test setup
├── utils/
│   ├── stagehand-helpers.js                 # Stagehand wrapper for app interactions
│   ├── test-data.js                         # Test fixtures and data
│   ├── assertions.js                        # Custom assertions
│   └── performance.js                       # Performance tracking
├── e2e/
│   ├── critical/                            # P0 tests (must pass)
│   │   ├── single-user-flow.test.js
│   │   ├── multiple-choice.test.js
│   │   ├── group-recommendations.test.js
│   │   ├── poster-display.test.js
│   │   ├── next-movie.test.js
│   │   ├── backend-integration.test.js
│   │   └── complete-journey.test.js
│   ├── high/                                # P1 tests
│   │   ├── mobile-responsive.test.js
│   │   ├── validation.test.js
│   │   ├── group-limits.test.js
│   │   └── [7 more test files]
│   ├── medium/                              # P2 tests
│   │   └── [10 test files]
│   └── low/                                 # P3 tests
│       └── [2 test files]
└── fixtures/
    ├── user-preferences.json
    └── expected-movies.json
```

#### 2.2 Core Helper Utility

**Create `tests/utils/stagehand-helpers.js`** - This is the most critical file for test implementation:

```javascript
import { Stagehand } from '@browserbasehq/stagehand';

export class PopChoiceTestHelper {
  constructor() {
    this.stagehand = null;
    this.page = null;
    this.baseUrl = process.env.TEST_APP_URL || 'http://localhost:5173';
  }

  async initialize() {
    this.stagehand = new Stagehand({
      env: 'BROWSERBASE',
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      modelName: 'claude-sonnet-4-5-20250929',
      modelApiKey: process.env.ANTHROPIC_API_KEY
    });
    await this.stagehand.init();
    this.page = this.stagehand.page;
    return this;
  }

  async navigateToApp() {
    await this.page.goto(this.baseUrl);
    await this.page.waitForLoadState('networkidle');
  }

  async fillGroupSize(numberOfPeople) {
    await this.stagehand.act({
      action: `Enter ${numberOfPeople} in the "How many people" input field`
    });
  }

  async answerQuestions(preferences) {
    await this.stagehand.act({
      action: `Enter "${preferences.favoriteMovie}" in the favorite movie question`
    });
    await this.stagehand.act({
      action: `Click the "${preferences.newOrClassic}" button`
    });
    for (const mood of preferences.moods) {
      await this.stagehand.act({ action: `Click the "${mood}" mood button` });
    }
    await this.stagehand.act({
      action: `Enter "${preferences.famousPerson}" in the famous person question`
    });
  }

  async submitQuestions() {
    await this.stagehand.act({
      action: 'Click the submit button to get movie recommendations'
    });
  }

  async extractMovieRecommendation() {
    return await this.stagehand.extract({
      instruction: 'Extract the movie title, year, and description from the recommendation',
      schema: {
        title: 'string',
        releaseYear: 'number',
        content: 'string'
      }
    });
  }

  async cleanup() {
    if (this.stagehand) {
      await this.stagehand.close();
    }
  }
}
```

**Create `tests/setup.js`:**
```javascript
import { beforeAll } from 'vitest';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

beforeAll(() => {
  console.log('Starting E2E test suite with BrowserBase + Stagehand');
});
```

### Phase 3: Test Execution Priority (Per E2E_testing_scenarios.md)

#### P0 Critical Tests (7 tests - Implement First)

These tests MUST pass before any release. Map to scenarios in `E2E_testing_scenarios.md`:

1. **Scenario 1.1** - `single-user-flow.test.js`: Basic movie recommendation flow
2. **Scenario 2.1** - `multiple-choice.test.js`: Multiple choice question interaction
3. **Scenario 3.1** - `group-recommendations.test.js`: Group flow for 2-8 people, verify 6 recommendations
4. **Scenario 5.1** - `poster-display.test.js`: Movie poster loads via TMDB API
5. **Scenario 6.1** - `next-movie.test.js`: "Next Movie" button functionality
6. **Scenario 7.1** - `backend-integration.test.js`: Cloudflare Worker communication, loading states
7. **Scenario 11.1** - `complete-journey.test.js`: Full end-to-end user journey

**Example P0 Test** - `tests/e2e/critical/single-user-flow.test.js`:
```javascript
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PopChoiceTestHelper } from '../../utils/stagehand-helpers';

describe('P0: Single User Flow - Basic Movie Recommendation', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new PopChoiceTestHelper();
    await testHelper.initialize();
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  it('should complete recommendation flow and receive a movie', async () => {
    await testHelper.navigateToApp();

    // Fill initial form
    await testHelper.fillGroupSize(1);
    await testHelper.stagehand.act({ action: 'Enter "2 hours" in the time available field' });
    await testHelper.stagehand.act({ action: 'Click the Start button' });

    // Answer questions
    await testHelper.answerQuestions({
      favoriteMovie: 'The Shawshank Redemption',
      newOrClassic: 'Classic',
      moods: ['Inspiring'],
      famousPerson: 'Morgan Freeman'
    });

    // Submit and wait for recommendation
    const startTime = Date.now();
    await testHelper.submitQuestions();
    await testHelper.page.waitForSelector('h1:has-text("(")', { timeout: 15000 });
    const responseTime = Date.now() - startTime;

    // Validate recommendation
    const movie = await testHelper.extractMovieRecommendation();
    expect(movie.title).toBeTruthy();
    expect(movie.releaseYear).toBeGreaterThan(1900);
    expect(movie.content).toBeTruthy();
    expect(responseTime).toBeLessThan(15000); // 15s max

    console.log('Received recommendation:', movie);
  });
});
```

#### P1 High Priority Tests (10 tests - Implement Second)

Run before releases:
- Scenario 1.2: Mobile responsiveness
- Scenario 2.2: Question validation
- Scenario 3.2: Max group size limit (8 people)
- Scenario 4.1: Catalog diversity
- Scenario 5.2: Poster fallback
- Scenario 6.2: Multiple "Next Movie" clicks
- Scenario 7.2: Multiple recommendations display
- Scenario 7.3: Service error handling
- Scenario 8.1: Network disconnection
- Scenario 11.2: Group journey

#### P2 Medium Priority Tests (10 tests - Run Nightly)

- Scenarios 3.3, 4.2, 5.3, 6.3, 8.2, 8.3, 9.1, 10.1, 10.2

#### P3 Low Priority Tests (2 tests - Run Weekly)

- Scenarios 8.4, 9.2

### Phase 4: Test Data and Utilities

**Create `tests/utils/test-data.js`:**
```javascript
export const singleUserPreferences = {
  numberOfPeople: 1,
  timeAvailable: '2 hours',
  favoriteMovie: 'The Shawshank Redemption',
  newOrClassic: 'Classic',
  moods: ['Inspiring'],
  famousPerson: 'Morgan Freeman'
};

export const groupPreferences = [
  {
    favoriteMovie: 'Inception',
    newOrClassic: 'New',
    moods: ['Serious'],
    famousPerson: 'Christopher Nolan'
  },
  // ... 3 more people
];
```

**Create `tests/utils/assertions.js`:**
```javascript
import { expect } from 'vitest';

export function assertMovieRecommendation(movie) {
  expect(movie).toBeDefined();
  expect(movie.title).toBeTruthy();
  expect(movie.releaseYear).toBeGreaterThan(1900);
  expect(movie.content).toBeTruthy();
}

export function assertResponseTime(timeMs, maxTimeMs) {
  expect(timeMs).toBeLessThan(maxTimeMs);
  console.log(`Response time: ${timeMs}ms (max: ${maxTimeMs}ms)`);
}
```

### Phase 5: Execution Workflow

#### Running Tests Locally

**Prerequisites:**
1. Start dev server: `npm run dev`
2. Ensure backend accessible at `https://pop-choice-worker.hawitrial.workers.dev/`
3. Configure `.env.test` with BrowserBase and API keys

**Commands:**
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI for debugging
npm run test:ui

# Run specific priority levels
npm run test:p0   # Critical tests only (7 tests)
npm run test:p1   # High priority tests (10 tests)
npm run test:p2   # Medium priority tests (10 tests)

# Run single test file
npx vitest run tests/e2e/critical/single-user-flow.test.js

# Watch mode (re-run on changes)
vitest watch
```

#### Test Strategy

1. **During Development:** Run P0 tests frequently
2. **Before Commits:** Run P0 + P1 tests
3. **Before Releases:** Run full suite (P0-P3)
4. **CI/CD:** Run P0 tests on every PR

### Phase 6: Special Considerations

#### Backend Integration
- Tests call **real Cloudflare Worker** (no mocking)
- Requires backend to be deployed and accessible
- Validates full request/response cycle

#### TMDB API Testing
- Uses **real TMDB API** with valid key from `.env.test`
- Test both success (poster loads) and failure (fallback) scenarios
- Be mindful of rate limits: 40 requests per 10 seconds

#### Mobile Testing
Use viewport emulation:
```javascript
await testHelper.initialize({
  viewport: { width: 390, height: 844 } // iPhone 13
});
```

#### Error Scenario Testing
Simulate network failures:
```javascript
await testHelper.page.route('**/pop-choice-worker.hawitrial.workers.dev/**',
  route => route.abort('failed')
);
```

### Phase 7: Implementation Roadmap

**Week 1: Foundation**
1. Install dependencies
2. Create configuration files
3. Set up test directory structure
4. Implement helper utilities (`stagehand-helpers.js`, `test-data.js`, `assertions.js`)
5. Create 1-2 P0 tests as proof of concept

**Week 2: P0 Critical Tests**
1. Implement all 7 P0 test scenarios
2. Validate against real backend
3. Ensure 100% pass rate
4. Document any bugs found

**Week 3: P1 High Priority**
1. Implement all 10 P1 test scenarios
2. Add mobile responsiveness tests
3. Implement error handling tests

**Week 4: P2 & P3**
1. Implement remaining P2 and P3 tests
2. Add comprehensive reporting
3. Document test suite

## Critical Files to Create/Modify

**New Files:**
1. `vitest.config.js` - Vitest test runner configuration
2. `.env.test` - Test environment variables
3. `tests/setup.js` - Global test setup
4. `tests/utils/stagehand-helpers.js` - **MOST CRITICAL** - Core Stagehand wrapper for app interaction
5. `tests/utils/test-data.js` - Test fixtures
6. `tests/utils/assertions.js` - Custom assertions
7. `tests/e2e/critical/single-user-flow.test.js` - First P0 test (pattern for others)
8. `tests/e2e/critical/[6 more P0 test files]`
9. `pop_choice_ai_e2e_execution_plan.md` - This plan document saved to project root

**Modified Files:**
1. `package.json` - Add test scripts and dependencies
2. `.gitignore` - Add test-related entries

## Verification Steps

After implementation, verify:

1. **Setup Validation:**
   ```bash
   npm run test:p0 --reporter=verbose
   ```
   Expected: All 7 P0 tests pass

2. **Backend Integration:**
   - Verify tests call real Cloudflare Worker
   - Check network tab shows requests to `https://pop-choice-worker.hawitrial.workers.dev/`

3. **TMDB Integration:**
   - Verify poster display test shows real poster URLs
   - Check fallback behavior when poster unavailable

4. **Mobile Testing:**
   - Verify mobile viewport tests run successfully
   - Check UI elements are visible and clickable

5. **Performance:**
   - Single user recommendations: < 5 seconds
   - Group recommendations: < 10 seconds

6. **Error Handling:**
   - Network failure test shows user-friendly error
   - Service unavailable test displays retry option

## Success Criteria

✅ All P0 critical tests pass (100%)
✅ Tests validate real backend integration
✅ TMDB poster fetching tested (success + failure)
✅ Mobile responsiveness verified
✅ Error handling works gracefully
✅ Performance targets met
✅ Test suite is maintainable and extensible

## Next Steps After Approval

1. Create `.env.test` with your BrowserBase and Anthropic API keys
2. Run `npm install --save-dev @browserbasehq/stagehand vitest @vitest/ui dotenv`
3. Create `vitest.config.js`
4. Implement `tests/utils/stagehand-helpers.js`
5. Write first P0 test: `single-user-flow.test.js`
6. Run `npm run test:p0` to validate setup
7. Continue with remaining P0 tests
8. Copy this plan to `pop_choice_ai_e2e_execution_plan.md` in project root
