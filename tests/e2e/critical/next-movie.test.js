import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PopChoiceTestHelper } from '../../utils/stagehand-helpers';
import { singleUserPreferences } from '../../utils/test-data';
import { assertMovieRecommendation } from '../../utils/assertions';

describe('P0: Next Movie Button - Alternative Recommendations', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new PopChoiceTestHelper();
    await testHelper.initialize();
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  it('should display different movie when clicking Next Movie button', async () => {
    await testHelper.navigateToApp();

    // Complete initial recommendation flow
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
    
    // Wait for first recommendation
    await testHelper.page.waitForSelector('h1', { timeout: 15000 });
    
    // Extract first movie
    const firstMovie = await testHelper.extractMovieRecommendation();
    assertMovieRecommendation(firstMovie);
    console.log('First recommendation:', firstMovie.title);

    // Click "Next Movie" button
    await testHelper.stagehand.act({
      action: 'Click the "Next Movie" button'
    });

    // Wait for new recommendation to appear
    await testHelper.page.waitForTimeout(2000); // Give time for new recommendation to load
    
    // Extract second movie
    const secondMovie = await testHelper.extractMovieRecommendation();
    assertMovieRecommendation(secondMovie);
    console.log('Second recommendation:', secondMovie.title);

    // Verify movies are different
    expect(secondMovie.title).not.toBe(firstMovie.title);
    
    // Verify both movies are valid recommendations
    expect(secondMovie.releaseYear).toBeGreaterThan(1900);
    expect(secondMovie.content).toBeTruthy();
  });

  it('should allow multiple Next Movie clicks', async () => {
    await testHelper.navigateToApp();

    // Complete initial flow
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

    const movies = [];
    
    // Get first movie
    const firstMovie = await testHelper.extractMovieRecommendation();
    movies.push(firstMovie.title);

    // Click Next Movie 3 times
    for (let i = 0; i < 3; i++) {
      await testHelper.stagehand.act({
        action: 'Click the "Next Movie" button'
      });
      await testHelper.page.waitForTimeout(2000);
      
      const movie = await testHelper.extractMovieRecommendation();
      movies.push(movie.title);
      assertMovieRecommendation(movie);
    }

    // Verify we got different movies (at least some should be different)
    const uniqueMovies = new Set(movies);
    expect(uniqueMovies.size).toBeGreaterThan(1);
    
    console.log('Movies seen:', movies);
  });
});
