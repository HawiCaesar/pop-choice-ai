import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PopChoiceTestHelper } from '../../utils/stagehand-helpers';
import { singleUserPreferences, testMoodOptions, testNewOrClassicOptions } from '../../utils/test-data';

describe('P0: Multiple Choice Questions - Interaction and Selection', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new PopChoiceTestHelper();
    await testHelper.initialize();
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  it('should allow users to select and change multiple choice options', async () => {
    await testHelper.navigateToApp();

    // Fill initial form
    await testHelper.fillGroupSize(1);
    await testHelper.fillTimeAvailable('2 hours');
    await testHelper.clickStart();

    // Test New/Classic button selection
    // First select "New"
    await testHelper.stagehand.act({
      action: 'Click the "New" button for the new or classic question'
    });
    
    // Verify selection is highlighted (check for ring class)
    const newButtonSelected = await testHelper.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const newButton = buttons.find(btn => btn.textContent.includes('New'));
      return newButton?.classList.contains('ring-2') || false;
    });
    expect(newButtonSelected).toBe(true);

    // Change selection to "Classic"
    await testHelper.stagehand.act({
      action: 'Click the "Classic" button for the new or classic question'
    });

    // Verify Classic is now selected and New is not
    const classicButtonSelected = await testHelper.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const classicButton = buttons.find(btn => btn.textContent.includes('Classic'));
      const newButton = buttons.find(btn => btn.textContent.includes('New'));
      return {
        classic: classicButton?.classList.contains('ring-2') || false,
        new: newButton?.classList.contains('ring-2') || false
      };
    });
    expect(classicButtonSelected.classic).toBe(true);
    expect(classicButtonSelected.new).toBe(false);

    // Test mood button selection (can select multiple)
    await testHelper.stagehand.act({
      action: 'Click the "Fun" mood button'
    });
    await testHelper.stagehand.act({
      action: 'Click the "Inspiring" mood button'
    });

    // Verify both moods are selected
    const moodsSelected = await testHelper.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const funButton = buttons.find(btn => btn.textContent.includes('Fun'));
      const inspiringButton = buttons.find(btn => btn.textContent.includes('Inspiring'));
      return {
        fun: funButton?.classList.contains('ring-2') || false,
        inspiring: inspiringButton?.classList.contains('ring-2') || false
      };
    });
    expect(moodsSelected.fun).toBe(true);
    expect(moodsSelected.inspiring).toBe(true);

    // Complete the form
    await testHelper.stagehand.act({
      action: `Enter "${singleUserPreferences.favoriteMovie}" in the favorite movie question`
    });
    await testHelper.stagehand.act({
      action: `Enter "${singleUserPreferences.famousPerson}" in the famous person question`
    });

    // Submit
    await testHelper.submitQuestions();

    // Verify recommendation appears
    await testHelper.page.waitForSelector('h1', { timeout: 15000 });
    const movie = await testHelper.extractMovieRecommendation();
    expect(movie.title).toBeTruthy();
  });
});
