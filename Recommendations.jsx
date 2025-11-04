import { useState, useEffect } from 'react';

export const Recommendations = ({ movieRecommendations, handleGoAgain }) => {
  const [currentRecommendationIndex, setCurrentRecommendationIndex] =
    useState(0);

  const lastRecommendationIndex = movieRecommendations.length - 1;
  const currentMovie = movieRecommendations[currentRecommendationIndex];
  const [currentMoviePosterUrl, setCurrentMoviePosterUrl] = useState(null);

  const handleNextRecommendation = () => {
    setCurrentRecommendationIndex(currentRecommendationIndex + 1);
    setCurrentMoviePosterUrl(null);
  };

  if (!movieRecommendations || movieRecommendations.length === 0) {
    return <div className='text-center mt-20'>Loading recommendations...</div>;
  }

  const getMoviePoster = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${currentMovie?.title}&include_adult=false&language=en-US&primary_release_year=${currentMovie?.releaseYear}&page=1`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_THEMOVIEDB_API_KEY}`
          }
        }
      );
      const data = await response.json();
      setCurrentMoviePosterUrl(data.results[0].poster_path);
    } catch (error) {
      console.error('Error getting movie poster:', error);
      setCurrentMoviePosterUrl(null);
    }
  };

  useEffect(() => {
    getMoviePoster();
  }, [currentMovie]);

  return (
    <div className='mt-[50px] mx-10'>
      <h1 className='text-[30px] font-bold text-center'>
        {currentMovie?.title} ({currentMovie?.releaseYear})
      </h1>

      <div className='flex justify-center w-[345px] h-[520px] mx-auto'>
        {currentMoviePosterUrl ? (
          <img
            src={`https://image.tmdb.org/t/p/original${currentMoviePosterUrl}`}
            alt={currentMovie?.title}
            className='w-[335px] h-auto rounded-md mx-auto'
          />
        ): <p className='text-center text-[20px]'>Loading poster...</p>}
      </div>

      <p className='text-[20px] text-center my-8'>{currentMovie?.content}</p>

      <button
        type='button'
        className='bg-[#51E08A] text-black px-4 py-2 rounded-md w-full text-[30px] submit-button'
        onClick={
          lastRecommendationIndex === currentRecommendationIndex
            ? handleGoAgain
            : handleNextRecommendation
        }
      >
        {lastRecommendationIndex === currentRecommendationIndex
          ? 'Go Again'
          : 'Next Movie'}
      </button>
    </div>
  );
};
