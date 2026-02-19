import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PopChoiceTestHelper } from '../../utils/stagehand-helpers';
import { singleUserPreferences } from '../../utils/test-data';
import { assertMovieRecommendation, assertResponseTime } from '../../utils/assertions';

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
    await testHelper.fillGroupSize(singleUserPreferences.numberOfPeople);
    await testHelper.fillTimeAvailable(singleUserPreferences.timeAvailable);
    await testHelper.clickStart();

    // Answer questions
    await testHelper.answerQuestions({
      favoriteMovie: singleUserPreferences.favoriteMovie,
      newOrClassic: singleUserPreferences.newOrClassic,
      moods: singleUserPreferences.moods,
      famousPerson: singleUserPreferences.famousPerson
    });

    // Submit and wait for recommendation
    const startTime = Date.now();
    await testHelper.submitQuestions();
    
    // Wait and extract (waitForMovieRecommendation is called inside extractMovieRecommendation)
    const movie = await testHelper.extractMovieRecommendation();
    const responseTime = Date.now() - startTime;

    console.log('Received recommendation:', movie);
    
    assertMovieRecommendation(movie);
    assertResponseTime(responseTime, 120000); // 120s max
  });
});
