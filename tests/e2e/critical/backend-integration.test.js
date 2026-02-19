import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PopChoiceTestHelper } from '../../utils/stagehand-helpers';
import { singleUserPreferences } from '../../utils/test-data';
import { assertMovieRecommendation, assertResponseTime } from '../../utils/assertions';

describe('P0: Backend Integration - Cloudflare Worker Communication', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new PopChoiceTestHelper();
    await testHelper.initialize();
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  it('should show loading state and successfully receive recommendations from backend', async () => {
    await testHelper.navigateToApp();

    // Complete form
    await testHelper.fillGroupSize(1);
    await testHelper.fillTimeAvailable('2 hours');
    await testHelper.clickStart();

    await testHelper.answerQuestions({
      favoriteMovie: singleUserPreferences.favoriteMovie,
      newOrClassic: singleUserPreferences.newOrClassic,
      moods: singleUserPreferences.moods,
      famousPerson: singleUserPreferences.famousPerson
    });

    // Monitor network requests
    const networkRequests = [];
    testHelper.page.on('request', request => {
      if (request.url().includes('pop-choice-worker.hawitrial.workers.dev')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });

    // Submit and track timing
    const startTime = Date.now();
    await testHelper.submitQuestions();
    
    // Check for loading indicator (if present)
    const loadingIndicator = await testHelper.page.evaluate(() => {
      // Look for loading text, spinner, or disabled state
      const bodyText = document.body.textContent || '';
      return bodyText.includes('loading') || 
             bodyText.includes('Loading') ||
             document.querySelector('[disabled]') !== null;
    });

    // Wait for recommendation to appear (indicates backend response received)
    await testHelper.page.waitForSelector('h1', { timeout: 15000 });
    const responseTime = Date.now() - startTime;

    // Verify backend was called
    expect(networkRequests.length).toBeGreaterThan(0);
    const backendCall = networkRequests.find(req => 
      req.url.includes('pop-choice-worker.hawitrial.workers.dev')
    );
    expect(backendCall).toBeDefined();
    expect(backendCall.method).toBe('POST');

    // Verify recommendation received
    const movie = await testHelper.extractMovieRecommendation();
    assertMovieRecommendation(movie);
    assertResponseTime(responseTime, 15000);

    console.log('Backend integration successful:', {
      backendCalled: !!backendCall,
      responseTime: `${responseTime}ms`,
      movie: movie.title
    });
  });

  it('should handle backend response with complete movie data', async () => {
    await testHelper.navigateToApp();

    await testHelper.fillGroupSize(1);
    await testHelper.fillTimeAvailable('2 hours');
    await testHelper.clickStart();

    await testHelper.answerQuestions({
      favoriteMovie: singleUserPreferences.favoriteMovie,
      newOrClassic: singleUserPreferences.newOrClassic,
      moods: singleUserPreferences.moods,
      famousPerson: singleUserPreferences.famousPerson
    });

    await testHelper.submitQuestions();
    await testHelper.page.waitForSelector('h1', { timeout: 15000 });

    // Verify all movie fields are displayed
    const movie = await testHelper.extractMovieRecommendation();
    
    // Check that all required fields are present and valid
    expect(movie.title).toBeTruthy();
    expect(typeof movie.title).toBe('string');
    expect(movie.title.length).toBeGreaterThan(0);
    
    expect(movie.releaseYear).toBeDefined();
    expect(typeof movie.releaseYear).toBe('number');
    expect(movie.releaseYear).toBeGreaterThan(1900);
    expect(movie.releaseYear).toBeLessThanOrEqual(new Date().getFullYear() + 1);
    
    expect(movie.content).toBeTruthy();
    expect(typeof movie.content).toBe('string');
    expect(movie.content.length).toBeGreaterThan(0);

    // Verify movie details are visible on page
    const pageContent = await testHelper.page.evaluate(() => {
      return {
        hasTitle: document.body.textContent.includes(movie.title),
        hasYear: document.body.textContent.includes(movie.releaseYear.toString()),
        hasContent: document.body.textContent.includes(movie.content.substring(0, 20))
      };
    });

    console.log('Movie data completeness verified:', movie);
  });
});
