import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PopChoiceTestHelper } from '../../utils/stagehand-helpers';
import { groupPreferences } from '../../utils/test-data';
import { assertGroupRecommendationsCount } from '../../utils/assertions';

describe('P0: Group Recommendations - Multi-User Flow', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new PopChoiceTestHelper();
    await testHelper.initialize();
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  it('should collect preferences for 4 people and return 6 recommendations', async () => {
    await testHelper.navigateToApp();

    // Fill initial form for group of 4
    const groupSize = 4;
    await testHelper.fillGroupSize(groupSize);
    await testHelper.fillTimeAvailable('3 hours');
    await testHelper.clickStart();

    // Answer questions for each person
    for (let i = 0; i < groupSize; i++) {
      const personPrefs = groupPreferences[i];
      
      // Answer questions for this person
      await testHelper.answerQuestions({
        favoriteMovie: personPrefs.favoriteMovie,
        newOrClassic: personPrefs.newOrClassic,
        moods: personPrefs.moods,
        famousPerson: personPrefs.famousPerson
      });

      // Click "Next Person" if not the last person
      if (i < groupSize - 1) {
        await testHelper.clickNextPerson();
        // Wait a moment for the form to reset
        await testHelper.page.waitForTimeout(500);
      }
    }

    // Submit final form (should show "Get Movie" button)
    const startTime = Date.now();
    await testHelper.submitQuestions();
    
    // Wait for recommendations to appear
    await testHelper.page.waitForSelector('h1', { timeout: 20000 });
    const responseTime = Date.now() - startTime;

    // Extract all recommendations
    const result = await testHelper.extractAllRecommendations();
    const recommendations = result.recommendations || [];

    // Verify we got 6 recommendations for group
    assertGroupRecommendationsCount(recommendations, groupSize);
    expect(responseTime).toBeLessThan(20000); // 20s max for group

    console.log(`Received ${recommendations.length} recommendations for group of ${groupSize}:`, recommendations);
  });

  it('should handle group of 2 people', async () => {
    await testHelper.navigateToApp();

    const groupSize = 2;
    await testHelper.fillGroupSize(groupSize);
    await testHelper.fillTimeAvailable('2 hours');
    await testHelper.clickStart();

    // Answer for person 1
    await testHelper.answerQuestions({
      favoriteMovie: groupPreferences[0].favoriteMovie,
      newOrClassic: groupPreferences[0].newOrClassic,
      moods: groupPreferences[0].moods,
      famousPerson: groupPreferences[0].famousPerson
    });

    // Click Next Person
    await testHelper.clickNextPerson();
    await testHelper.page.waitForTimeout(500);

    // Answer for person 2
    await testHelper.answerQuestions({
      favoriteMovie: groupPreferences[1].favoriteMovie,
      newOrClassic: groupPreferences[1].newOrClassic,
      moods: groupPreferences[1].moods,
      famousPerson: groupPreferences[1].famousPerson
    });

    // Submit
    await testHelper.submitQuestions();
    await testHelper.page.waitForSelector('h1', { timeout: 20000 });

    const result = await testHelper.extractAllRecommendations();
    const recommendations = result.recommendations || [];
    
    // Should still get 6 recommendations for group
    assertGroupRecommendationsCount(recommendations, groupSize);
  });
});
