import { expect } from 'vitest';

export function assertMovieRecommendation(movie) {
  expect(movie).toBeDefined();
  expect(movie.title).toBeTruthy();
  expect(typeof movie.title).toBe('string');
  expect(movie.releaseYear).toBeGreaterThan(1900);
  expect(movie.releaseYear).toBeLessThanOrEqual(new Date().getFullYear() + 1);
  expect(movie.content).toBeTruthy();
  expect(typeof movie.content).toBe('string');
}

export function assertResponseTime(timeMs, maxTimeMs) {
  expect(timeMs).toBeLessThan(maxTimeMs);
  console.log(`Response time: ${timeMs}ms (max: ${maxTimeMs}ms)`);
}

export function assertRecommendationsCount(recommendations, expectedCount) {
  expect(recommendations).toBeDefined();
  expect(Array.isArray(recommendations)).toBe(true);
  expect(recommendations.length).toBe(expectedCount);
  
  recommendations.forEach((movie, index) => {
    assertMovieRecommendation(movie);
  });
}

export function assertGroupRecommendationsCount(recommendations, groupSize) {
  // Group recommendations should return 6 movies regardless of group size
  const expectedCount = 6;
  assertRecommendationsCount(recommendations, expectedCount);
}

export function assertSingleUserRecommendationCount(recommendations) {
  // Single user should get 1 recommendation
  assertRecommendationsCount(recommendations, 1);
}
