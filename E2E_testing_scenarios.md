# Pop Choice - End-to-End Testing Scenarios

## Overview
This document outlines end-to-end test scenarios for the Pop Choice movie recommendation app, covering main requirements and stretch goals.

---

## 1. Single User Flow - Main Requirements

### Scenario 1.1: Basic Movie Recommendation Flow
**Objective:** Verify that a single user can complete the recommendation flow and receive a movie suggestion

**Note:** This test requires the Cloudflare Worker backend to be deployed and accessible.

**Steps:**
1. User opens the application
2. User is presented with initial questions about movie preferences
3. User answers all required questions
4. User submits their preferences
5. System displays a movie recommendation
6. Movie details are displayed (title, year, description, etc.)

**Expected Result:** User receives a relevant movie recommendation based on their preferences

**Verification Points:**
- Questions are displayed clearly
- User can navigate through questions
- Recommendation is displayed without errors
- Recommendation matches the user's stated preferences
- Movie details are complete and accurate

---

### Scenario 1.2: Mobile Responsiveness
**Objective:** Verify the app works correctly on mobile devices

**Steps:**
1. Access the app on a mobile device (or mobile viewport)
2. Complete the recommendation flow
3. Verify all UI elements are properly sized and accessible

**Expected Result:** App is fully functional and visually appropriate on mobile screens

---

## 2. Multiple Choice Questions

### Scenario 2.1: Answer Multiple Choice Questions
**Objective:** Verify users can interact with multiple choice questions

**Steps:**
1. User starts the recommendation flow
2. Multiple choice questions are presented
3. User selects options from the provided choices
4. User can change their selection before submitting
5. User submits their answers

**Expected Result:**
- All multiple choice options are clickable and selectable
- Selected options are visually highlighted
- Selections are properly captured and used for recommendations

---

### Scenario 2.2: Question Validation
**Objective:** Ensure users cannot proceed without answering required questions

**Steps:**
1. User starts the recommendation flow
2. User attempts to skip required questions
3. System validates user input

**Expected Result:** System prevents progression until all required questions are answered

---

## 3. Multi-User Flow (N+ People, Currently Limited to 8)

### Scenario 3.1: Group Recommendation for 2-8 People
**Objective:** Verify the app can handle multiple users and provide group recommendations

**Note:** This test validates real frontend-to-backend integration with the deployed Cloudflare Worker.

**Steps:**
1. User indicates they want recommendations for a group
2. User specifies number of people (between 2-8)
3. System collects preferences for each person sequentially
4. Each person answers their preference questions
5. User submits after all people have answered
6. System displays 6 movie recommendations suitable for the group

**Expected Result:**
- App accepts group size input (2-8 people)
- Questions are presented for each person in sequence
- All questions are collected successfully without errors
- 6 movie recommendations are displayed after submission
- Recommendations appear relevant to the collective preferences entered
- No errors or failures occur during the process

---

### Scenario 3.2: Maximum Group Size Limit
**Objective:** Verify the 8-person limit is enforced

**Steps:**
1. User attempts to enter more than 8 people
2. System validates the input

**Expected Result:**
- System displays error or prevents input above 8
- User is notified of the maximum limit

---

### Scenario 3.3: Minimum Group Size
**Objective:** Verify handling of group size less than 2

**Steps:**
1. User enters 1 or 0 for group size
2. System validates the input

**Expected Result:** System either defaults to single-user mode or prompts for valid group size

---

## 4. Movie Catalog Diversity

### Scenario 4.1: Diverse Movie Recommendations
**Objective:** Verify the app can recommend movies from various sources

**Note:** The backend uses an extended movie database (movies.txt) in addition to content.js. This test verifies users can receive recommendations from the full catalog.

**Steps:**
1. User completes preference questions with varied inputs
2. User submits and receives movie recommendations
3. User repeats with different preference combinations

**Expected Result:**
- App successfully displays movie recommendations
- All movie fields (title, year, description) are shown correctly
- Recommendations span a diverse catalog (not limited to just 8 movies from content.js)

---

### Scenario 4.2: Recommendation Variety Across Sessions
**Objective:** Verify different user preferences produce different movie recommendations

**Steps:**
1. Complete recommendation flow with action/thriller preferences
2. Note the recommended movies
3. Start new session with comedy/lighthearted preferences
4. Note the recommended movies
5. Compare the two sets of recommendations

**Expected Result:**
- Different preference inputs produce different movie recommendations
- Recommendations are appropriately matched to stated preferences
- App shows it has access to a varied movie catalog

---

## 5. Movie Poster Display (TMDB Integration)

### Scenario 5.1: Movie Poster Loads Successfully
**Objective:** Verify movie posters are displayed with recommendations

**Steps:**
1. User receives a movie recommendation
2. User observes the recommendation display
3. Poster image appears alongside movie details

**Expected Result:**
- Poster image loads and displays correctly
- Image is properly sized and positioned
- Movie title matches the poster shown

---

### Scenario 5.2: Movie Poster Fallback
**Objective:** Verify graceful handling when poster is unavailable

**Steps:**
1. User receives a movie recommendation
2. Poster image is not available for the movie
3. User observes how the app handles missing poster

**Expected Result:**
- App displays placeholder image or appropriate fallback
- User can still see all other movie details (title, year, description)
- No visual errors or broken images appear
- App remains fully functional

---

### Scenario 5.3: Poster Service Unavailable
**Objective:** Verify app resilience when poster service is unavailable

**Steps:**
1. Simulate poster service being unavailable
2. User completes preference flow and receives recommendation

**Expected Result:**
- Recommendation is still displayed with all text information
- User sees fallback state for poster (placeholder or no image)
- User is not blocked from viewing or interacting with recommendations
- App remains stable and functional

---

## 6. Next Movie Button Feature

### Scenario 6.1: Get Next Recommendation
**Objective:** Verify user can request additional movie recommendations

**Steps:**
1. User completes initial recommendation flow
2. User views first movie recommendation
3. User clicks "Next Movie" button
4. System provides a different movie recommendation based on same preferences

**Expected Result:**
- "Next Movie" button is visible and clickable
- New recommendation is displayed
- New recommendation is different from previous one
- Recommendations remain relevant to original preferences

---

### Scenario 6.2: Multiple Next Movie Clicks
**Objective:** Verify user can cycle through multiple recommendations

**Steps:**
1. User receives initial recommendation
2. User clicks "Next Movie" 5-10 times
3. Track each recommendation

**Expected Result:**
- Each click produces a different recommendation
- System has sufficient recommendations to provide
- No duplicate recommendations in sequence

---

### Scenario 6.3: Next Movie with Group Recommendations
**Objective:** Verify "Next Movie" works for group recommendations

**Steps:**
1. Complete group recommendation flow (multiple people)
2. View initial 6 movie recommendations
3. Click "Next Movie" button

**Expected Result:**
- System provides additional group-appropriate recommendations
- All 6 recommendations refresh or new ones are appended

---

## 7. Backend Integration (Frontend Perspective)

**Note:** This section focuses on how the frontend integrates with the backend, not backend implementation details. Backend internals (OpenAI, Supabase, embeddings) are tested separately in backend test suites.

### Scenario 7.1: Successful Recommendation Request Flow
**Objective:** Verify frontend successfully communicates with the backend and displays recommendations

**Steps:**
1. User completes all preference questions
2. User submits preferences
3. System shows loading state while processing
4. System receives and displays movie recommendations

**Expected Result:**
- Loading indicator appears during backend processing
- No timeout or connection errors occur
- Movie recommendations are displayed successfully
- All movie details (title, year, description) are shown correctly
- User can interact with recommendations (click "Next Movie", etc.)

---

### Scenario 7.2: Multiple Recommendations Display
**Objective:** Verify app correctly displays varying numbers of movie recommendations

**Steps:**
1. Complete single-user flow (expect 1 recommendation)
2. Verify all movie information is displayed correctly
3. Complete group flow for 4 people (expect 6 recommendations)
4. Verify all 6 movies are displayed with complete information

**Expected Result:**
- Single user receives complete movie details (title, year, description, poster)
- Group recommendations show multiple movies (6 expected)
- Each movie in the list shows complete and accurate information
- Layout adapts appropriately to number of recommendations
- No missing data or rendering errors

---

### Scenario 7.3: Service Error Handling
**Objective:** Verify app gracefully handles service failures

**Steps:**
1. Simulate service error scenarios (service unavailable, timeout, network issues)
2. User submits preferences
3. Observe how app communicates the error to user

**Expected Result:**
- User receives clear, friendly error message
- Message explains what happened without technical jargon (e.g., "Unable to get recommendations, please try again")
- App provides clear options: retry or go back to edit preferences
- App doesn't crash or show technical error codes
- User can recover from the error gracefully

---

## 8. Error Handling and Edge Cases

### Scenario 8.1: Network Disconnection
**Objective:** Verify app behavior when network is lost

**Steps:**
1. User starts recommendation flow
2. Simulate network disconnection
3. User attempts to submit preferences

**Expected Result:**
- User receives clear error message
- App doesn't crash or freeze
- User can retry when connection is restored

---

### Scenario 8.2: Service Temporarily Unavailable
**Objective:** Verify user experience when service is temporarily overloaded

**Steps:**
1. Trigger scenario where service is temporarily unavailable (rate limited)
2. User submits preferences
3. Observe error message and options presented to user

**Expected Result:**
- User receives clear, friendly error message (e.g., "Service is busy, please try again")
- Message explains what happened without technical jargon
- Option to retry is clearly provided
- App doesn't crash or freeze
- User can navigate back to modify preferences if desired

---

### Scenario 8.3: Empty or Invalid Preferences
**Objective:** Verify handling of edge case inputs

**Steps:**
1. User submits empty strings or invalid data
2. System validates input

**Expected Result:**
- Input validation prevents submission
- Clear error messages guide user to correct input

---

### Scenario 8.4: Limited Matching Movies
**Objective:** Verify handling when few movies match user's specific preferences

**Steps:**
1. User enters very specific or unusual preferences that may have limited matches
2. User submits and views recommendations

**Expected Result:**
- App still provides movie recommendations (fallback if needed)
- User is informed if matches are limited or approximate
- App doesn't show empty state or crash
- User can navigate back to adjust preferences if desired

---

## 9. Performance and Load

### Scenario 9.1: Recommendation Response Time
**Objective:** Verify acceptable response times for recommendations

**Note:** Response time includes real backend processing (OpenAI API calls, vector database queries).

**Steps:**
1. User completes preference questions
2. Measure time from submission to recommendation display
3. Time includes: frontend request, backend processing, response parsing, and rendering

**Expected Result:**
- Total time is under 5 seconds for single user
- Total time is under 10 seconds for group recommendations
- Loading states are displayed during backend processing

---

### Scenario 9.2: Concurrent Users
**Objective:** Verify app handles multiple simultaneous users

**Steps:**
1. Simulate 10-50 concurrent users requesting recommendations
2. Monitor system performance and response times

**Expected Result:**
- All users receive recommendations successfully
- Response times remain acceptable
- No crashes or errors occur

---

## 10. Data Consistency

### Scenario 10.1: Movie Data Accuracy
**Objective:** Verify movie data from content.js is displayed accurately

**Steps:**
1. Review source movie data in content.js
2. Request recommendations
3. Compare displayed data with source

**Expected Result:**
- All movie details match source data exactly
- No data corruption or missing fields

---

### Scenario 10.2: Recommendation Consistency
**Objective:** Verify same preferences yield similar recommendations

**Steps:**
1. User completes flow with specific preferences (e.g., "action movie, exciting, superhero")
2. Note the recommended movies
3. Restart app and enter identical preferences
4. Note the new recommendations
5. Compare the two sets

**Expected Result:**
- Recommendations are similar or identical between runs
- If not identical, recommendations share similar themes/genres
- User can expect consistent results for consistent inputs

---

## 11. User Experience Flow

### Scenario 11.1: Complete End-to-End Journey (Single User)
**Objective:** Validate the entire user journey from start to finish

**Steps:**
1. User opens app for the first time
2. User is greeted/introduced to the app
3. User answers all preference questions
4. User receives movie recommendation with poster
5. User clicks "Next Movie" for alternative
6. User reviews recommendations and exits

**Expected Result:**
- Flow is intuitive and smooth
- No confusing steps or dead ends
- User can complete journey without assistance

---

### Scenario 11.2: Complete End-to-End Journey (Group)
**Objective:** Validate group recommendation user journey

**Steps:**
1. User opens app and selects group mode
2. Specifies 4 people
3. Completes preferences for all 4 people
4. Receives 6 movie recommendations
5. Views posters for all recommendations
6. Clicks "Next Movie" for more options
7. Selects a movie for the group

**Expected Result:**
- Group flow is clear and manageable
- All 4 people's preferences are captured
- 6 recommendations are displayed attractively
- User can easily navigate and make selection

---

## Testing Approach: Real Backend Integration

### Backend Worker (Cloudflare)
**Approach: Test against real backend**
- E2E tests will call the actual Cloudflare Worker endpoint (`https://pop-choice-worker.hawitrial.workers.dev/`)
- Tests validate full frontend-to-backend integration
- Requires backend to be deployed and accessible
- Tests both success and error scenarios with real API responses

### TMDB API
**Approach: Use real API**
- Tests call actual TMDB API with valid API key (`VITE_THEMOVIEDB_API_KEY`)
- Validates real poster fetching behavior from frontend
- Tests both success and failure paths

### Content.js Data
**Approach: Use real data**
- Test against actual content.js file in the repository
- Validates data format and completeness

### Backend Data Sources (movies.txt)
**Note:** movies.txt is processed by the backend into the vector database. The frontend doesn't directly access this file - it only receives movies from the backend API response.

---

## Test Environment Requirements

### Prerequisites

**Frontend Test Environment:**
- TMDB API key configured in environment (`VITE_THEMOVIEDB_API_KEY`)
- content.js with valid movie data
- Frontend app running locally or deployed

**Backend Dependencies:**
- Cloudflare Worker backend must be deployed and accessible
- Backend endpoint: `https://pop-choice-worker.hawitrial.workers.dev/`
- Backend handles: OpenAI API integration, Supabase vector database, movies.txt processing
- **Note:** OpenAI API key and Supabase configuration are backend dependencies (not required in frontend test environment)

### Test Data Needed
- Various user preference combinations
- Edge case preference inputs
- Multiple group size configurations
- Network interruption simulation capability

### Browsers/Devices to Test
- Chrome (desktop and mobile)
- Safari (desktop and mobile)
- Firefox (desktop)
- Edge (desktop)
- iOS Safari (iPhone)
- Android Chrome

---

## Success Criteria

A successful E2E test run should demonstrate:
1. 100% of critical path scenarios pass
2. All frontend-backend integration points work correctly with deployed Cloudflare Worker
3. Frontend correctly handles backend responses (success and error cases)
4. Multi-user functionality works for 2-8 people
5. Movie posters load successfully in 95%+ of cases (TMDB API integration)
6. Response times meet performance targets (including real backend processing)
7. Error handling gracefully manages all failure scenarios
8. Mobile experience is fully functional
9. No critical bugs or crashes occur

**Note:** Backend services (OpenAI API, Supabase vector database, embeddings generation) are tested separately in backend-specific test suites. Frontend E2E tests verify integration with the backend API, not backend implementation details.

---

## Test Execution Priority

**P0 (Critical - Must Pass):**
- Scenarios 1.1, 2.1, 3.1, 5.1, 6.1, 7.1, 11.1

**P1 (High - Should Pass):**
- Scenarios 1.2, 2.2, 3.2, 4.1, 5.2, 6.2, 7.2, 7.3, 8.1, 11.2

**P2 (Medium - Nice to Pass):**
- Scenarios 3.3, 4.2, 5.3, 6.3, 8.2, 8.3, 9.1, 10.1, 10.2

**P3 (Low - Can Defer):**
- Scenarios 8.4, 9.2

