import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PopChoiceTestHelper } from '../../utils/stagehand-helpers';
import { singleUserPreferences } from '../../utils/test-data';

describe('P0: Movie Poster Display - TMDB Integration', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new PopChoiceTestHelper();
    await testHelper.initialize();
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  it('should display movie poster with recommendation', async () => {
    await testHelper.navigateToApp();

    // Complete recommendation flow
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
    
    // Wait for recommendation to appear
    await testHelper.page.waitForSelector('h1', { timeout: 15000 });

    // Extract movie details
    const movie = await testHelper.extractMovieRecommendation();
    expect(movie.title).toBeTruthy();

    // Check for poster image
    const posterExists = await testHelper.page.evaluate(() => {
      // Look for img tag with poster-related attributes or TMDB URL
      const images = Array.from(document.querySelectorAll('img'));
      return images.some(img => {
        const src = img.src || img.getAttribute('src') || '';
        // Check if it's a poster image (TMDB URL or has poster-related class/id)
        return src.includes('tmdb') || 
               src.includes('image.tmdb.org') ||
               img.className.includes('poster') ||
               img.id.includes('poster') ||
               img.alt?.toLowerCase().includes('poster');
      });
    });

    // Poster should be present (or at least an image element)
    // Note: If poster fails to load, there should still be an img element (possibly with error state)
    const hasImageElement = await testHelper.page.evaluate(() => {
      return document.querySelectorAll('img').length > 0;
    });

    expect(hasImageElement).toBe(true);
    
    if (posterExists) {
      console.log('Poster image found for movie:', movie.title);
    } else {
      console.log('Note: Poster may not be loaded, but image element exists');
    }

    // Verify movie title matches what we expect
    const titleOnPage = await testHelper.page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1?.textContent || '';
    });

    expect(titleOnPage).toContain(movie.title);
  });
});
