# Pop Choice
A movie recommendation app incorporating text chunking, AI embedding and AI chat like functionality.

Open API AI usage found at the cloudflare worker project here

https://github.com/HawiCaesar/pop-choice-worker-ai

## Getting Started
Install the dependencies and run the project
```
npm install
npm start
```

## How to test the app.
- For Main requirements, look at content.js.
- Open the app and follow the questions and see if you get a movie from content.js

- For stretch goals, look at movies.txt
- (To be filled in, I'm working on it)



### Main requirements 
- Built from scratch ✅
- Followed figma design (more mobile friendly) ✅
- Make sure to
    - Use a vector database to embedding ✅ (used Cloudflare workers to call the supabase DB)
    - Use OpenAI API ✅ (used Cloudflare workers to call the OpenAI API)
    - use the movies array in content.js ✅
- Use any framework or library (I used React) ✅

### Stetch goals
- Make app for N+ people,  ✅, 6 movies recommendations based on preferences given by each person.
- Multiple choice questions ✅
- Use text chunking from movies.txt ✅
- Show a movie poster (use this API, https://developer.themoviedb.org/docs/getting-started) ✅
- Add "Next Movie" button for next recommendation. ✅

---

## End-to-End Tests

### AI Testing Workflow

E2E tests were structured using plan files to guide AI-generated test cases.  
This ensured deterministic coverage and reduced flaky test generation.

E2E tests are written with [Vitest](https://vitest.dev/) and [Stagehand](https://github.com/browserbasehq/stagehand), running against a real browser session via [Browserbase](https://browserbase.com/).

### Running the tests

```bash
npm run test:e2e
```

Make sure `.env.test` is configured with your `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`, `ANTHROPIC_API_KEY`, and `TEST_APP_URL` before running.

### P0: Single User Flow

> `tests/e2e/critical/single-user-flow.test.js`

Tests the core happy path for a single user getting a movie recommendation.

| Scenario | Description | Status |
|---|---|---|
| Complete recommendation flow | Fills group size (1 person) and time available (2 hours), answers preference questions (favorite movie, new/classic, mood, famous person), submits, and asserts a valid movie recommendation is returned within 120s | ✅ Passing |

**Test inputs used:**
- Favorite movie: *The Shawshank Redemption*
- Preference: Classic
- Mood: Inspiring
- Famous person: Morgan Freeman

### P0: Multiple Choice Questions

> `tests/e2e/critical/multiple-choice.test.js`

Tests that multiple choice question interactions (New/Classic toggle, multi-mood selection) work correctly and selections are visually reflected before submission.

| Scenario | Description | Status |
|---|---|---|
| Select and change multiple choice options | Selects "New" then switches to "Classic", verifies only Classic is highlighted; selects "Fun" and "Inspiring" moods, verifies both are highlighted; completes and submits the form and asserts a valid movie recommendation is returned | ✅ Passing |

**Test inputs used:**
- Favorite movie: *The Shawshank Redemption*
- Preference: Classic (toggled from New)
- Moods: Fun, Inspiring
- Famous person: Morgan Freeman

### Test Video Recordings

> Recorded via Browserbase — full browser sessions of each test run.

| Test | Video |
|---|---|
| P0: Single User Flow | [Video Link](https://drive.google.com/file/d/1GMoxysSUxsMeGUoMUvIQHj_SUT4QkpOi/view?usp=sharing) |
| P0: Multiple Choice Questions | [Video Link](https://drive.google.com/file/d/1p5za9fZjuCLGfYN7KwtS9raBVdOEet52/view?usp=drive_link) |

