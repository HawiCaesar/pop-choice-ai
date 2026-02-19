import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

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
      model: { 
        modelName: 'anthropic/claude-sonnet-4-20250514', 
        apiKey: process.env.ANTHROPIC_API_KEY
      }
    });
    await this.stagehand.init();
    this.page = this.stagehand.context.activePage();
    if (!this.page) {
      throw new Error('No active page available after initialization');
    }
    return this;
  }

  async navigateToApp() {
    await this.page.goto(this.baseUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fillGroupSize(numberOfPeople) {
    // Fix: Pass string directly, not object
    await this.stagehand.act(`Enter ${numberOfPeople} in the "How many people" input field`);
  }

  async fillTimeAvailable(time) {
    await this.stagehand.act(`Enter "${time}" in the "How much time do you have?" input field`);
  }

  async clickStart() {
    await this.stagehand.act('Click the Start button');
  }

  async answerQuestions(preferences) {
    await this.stagehand.act(`Enter "${preferences.favoriteMovie}" in the favorite movie question`);
    await this.stagehand.act(`Click the "${preferences.newOrClassic}" button`);
    for (const mood of preferences.moods) {
      await this.stagehand.act(`Click the "${mood}" mood button`);
    }
    await this.stagehand.act(`Enter "${preferences.famousPerson}" in the famous person question`);
  }

  async submitQuestions() {
    await this.stagehand.act('Click the submit button to get movie recommendations');
  }

  async clickNextPerson() {
    await this.stagehand.act('Click the Next Person button');
  }

  /**
   * Wait for the movie recommendation to appear on the page.
   * Waits for the h1 element that contains a movie title with year in parentheses.
   */
  async waitForMovieRecommendation(timeout = 60000) {
    const startTime = Date.now();
    const pollInterval = 1000; // Check every second
    
    console.log('Waiting for movie recommendation to appear...');
    
    while (Date.now() - startTime < timeout) {
      try {
        // Check if any h1 contains a year pattern
        const hasMovieH1 = await this.page.evaluate(() => {
          const h1Elements = Array.from(document.querySelectorAll('h1'));
          return h1Elements.some(h1 => {
            const text = h1.textContent || '';
            // Check if it matches pattern like "Movie Title (2023)"
            return /\((\d{4})\)/.test(text) && text.length > 10;
          });
        });

        if (hasMovieH1) {
          // Additional wait to ensure content is fully rendered
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const h1Text = await this.page.evaluate(() => {
            const h1 = document.querySelector('h1');
            return h1 ? h1.textContent : '';
          }).catch(() => '');
          console.log('Movie recommendation appeared! H1 text:', h1Text);
          return;
        }
      } catch (error) {
        // Continue polling
        console.log(error.message)
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    // Timeout reached - get debug info
    const pageContent = await this.getPageContent();
    console.error('Failed to wait for movie recommendation. Page content:', JSON.stringify(pageContent, null, 2));
    throw new Error(`Movie recommendation did not appear within ${timeout}ms`);
  }

  /**
   * Get page content for debugging purposes
   */
  async getPageContent() {
    try {
      const allH1s = await this.page.evaluate(() => 
        Array.from(document.querySelectorAll('h1')).map(el => el.textContent)
      ).catch(() => []);
      
      const allPs = await this.page.evaluate(() => 
        Array.from(document.querySelectorAll('p')).map(el => el.textContent?.substring(0, 100))
      ).catch(() => []);
      
      const bodyText = await this.page.evaluate(() => document.body.textContent).catch(() => 'Could not get body text');
      
      return {
        h1s: allH1s,
        paragraphs: allPs,
        bodyPreview: bodyText ? bodyText.substring(0, 500) : 'Could not get body text',
        url: this.page.url()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async extractMovieRecommendation() {
    // First ensure the movie is visible
    await this.waitForMovieRecommendation();
    
    console.log('Starting the extraction process...');

    try {
      // Add timeout wrapper around extraction (30s max for extraction)
      const extractionPromise = this.stagehand.extract(
        'Extract the movie title, year, and description from the recommendation. The title is in an h1 with format "Title (Year)", description is in a paragraph below.',
        z.object({
          title: z.string(),
          releaseYear: z.number(),
          content: z.string()
        })
      );

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Extraction timed out after 30 seconds')), 30000)
      );

      const result = await Promise.race([extractionPromise, timeoutPromise]);
      
      console.log('Extracted movie recommendation:', JSON.stringify(result, null, 2));
      
      if (!result || !result.title) {
        // Only get page content if extraction failed
        const pageContent = await this.getPageContent();
        throw new Error(`Failed to extract movie data. Got: ${JSON.stringify(result)}. Page content: ${JSON.stringify(pageContent)}`);
      }
      
      return result;
    } catch (error) {
      console.error('Extraction failed:', error.message);
      // Only get page content on error to save time
      const pageContent = await this.getPageContent();
      console.error('Page content:', JSON.stringify(pageContent, null, 2));
      throw error;
    }
  }

  async extractAllRecommendations() {
    return await this.stagehand.extract(
      'Extract all movie recommendations displayed on the page, including title, year, and description for each',
      z.object({
        recommendations: z.array(z.object({
          title: z.string(),
          releaseYear: z.number(),
          content: z.string()
        }))
      })
    );
  }

  async cleanup() {
    if (this.stagehand) {
      await this.stagehand.close();
    }
  }
}
