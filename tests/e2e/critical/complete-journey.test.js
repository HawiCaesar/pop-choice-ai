import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PopChoiceTestHelper } from '../../utils/stagehand-helpers';
import { singleUserPreferences } from '../../utils/test-data';
import { assertMovieRecommendation } from '../../utils/assertions';

describe('P0: Complete End-to-End Journey - Single User', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new PopChoiceTestHelper();
    await testHelper.initialize();
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  it('should complete full user journey from start to finish', async () => {
    // Step 1: User opens app for the first time
    await testHelper.navigateToApp();
    
    // Verify initial screen is displayed
    const initialScreen = await testHelper.page.evaluate(() => {
      return {
        hasTitle: document.body.textContent.includes('Pop Choice'),
        hasForm: document.querySelector('form') !== null,
        hasInputs: document.querySelectorAll('input').length > 0
      };
    });
    expect(initialScreen.hasTitle || initialScreen.hasForm).toBe(true);

    // Step 2: User answers initial preference questions
    await testHelper.fillGroupSize(singleUserPreferences.numberOfPeople);
    await testHelper.fillTimeAvailable(singleUserPreferences.timeAvailable);
    await testHelper.clickStart();

    // Step 3: User answers all preference questions
    await testHelper.answerQuestions({
      favoriteMovie: singleUserPreferences.favoriteMovie,
      newOrClassic: singleUserPreferences.newOrClassic,
      moods: singleUserPreferences.moods,
      famousPerson: singleUserPreferences.famousPerson
    });

    // Step 4: User receives movie recommendation with poster
    await testHelper.submitQuestions();
    await testHelper.page.waitForSelector('h1', { timeout: 15000 });

    const firstMovie = await testHelper.extractMovieRecommendation();
    assertMovieRecommendation(firstMovie);
    
    // Verify recommendation screen is displayed
    const recommendationScreen = await testHelper.page.evaluate(() => {
      return {
        hasTitle: document.querySelector('h1') !== null,
        hasContent: document.body.textContent.length > 100,
        hasButton: Array.from(document.querySelectorAll('button')).some(
          btn => btn.textContent.includes('Next') || btn.textContent.includes('Movie')
        )
      };
    });
    expect(recommendationScreen.hasTitle).toBe(true);
    expect(recommendationScreen.hasContent).toBe(true);

    // Step 5: User clicks "Next Movie" for alternative
    await testHelper.stagehand.act({
      action: 'Click the "Next Movie" button'
    });
    await testHelper.page.waitForTimeout(2000);

    const secondMovie = await testHelper.extractMovieRecommendation();
    assertMovieRecommendation(secondMovie);
    expect(secondMovie.title).not.toBe(firstMovie.title);

    // Step 6: User reviews recommendations and can exit/interact
    // Verify user can see multiple recommendations
    const canInteract = await testHelper.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.length > 0 && buttons.some(btn => !btn.disabled);
    });
    expect(canInteract).toBe(true);

    console.log('Complete journey successful:', {
      firstMovie: firstMovie.title,
      secondMovie: secondMovie.title,
      flowCompleted: true
    });
  });

  it('should allow user to complete journey without errors', async () => {
    await testHelper.navigateToApp();

    // Track any console errors
    const errors = [];
    testHelper.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Complete full flow
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

    // Verify no critical errors occurred
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('404') &&
      !err.includes('net::ERR')
    );
    
    expect(criticalErrors.length).toBe(0);
    console.log('Journey completed without critical errors');
  });
});
