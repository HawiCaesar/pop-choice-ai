import { useState } from 'react';

export const Questions = ({
  handleFinalMovieSelectionSubmit,
  handleNextPerson,
  allowedNumberOfPeople,
  currentPerson,
  usingAI
}) => {
  // State for all form fields
  const [favoriteMovie, setFavoriteMovie] = useState('');
  const [newOrClassic, setNewOrClassic] = useState('');
  const [mood, setMood] = useState([]);
  const [famousPerson, setFamousPerson] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (currentPerson >= allowedNumberOfPeople) {
        // collect the last person's responses. React state is async, so we need to wait for the state to be updated before submitting the form.
        handleFinalMovieSelectionSubmit(e); 
    } else {
      handleNextPerson(e);

      // Reset all state after form submission
      setFavoriteMovie('');
      setNewOrClassic('');
      setMood([]);
      setFamousPerson('');
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {/* Question 1: Favorite Movie */}
      <div className='mx-auto mb-8'>
        <p className='pb-2 text-base context-question'>
          What's your favorite movie and why?
        </p>
        <input
          type='text'
          placeholder='Enter your answer here'
          name="What's your favorite movie and why?"
          value={favoriteMovie}
          onChange={(e) => setFavoriteMovie(e.target.value)}
          className='text-sm context-answer w-full bg-[#3B4877] rounded-md p-2 h-[100px]'
          required
        />
      </div>

      {/* Question 2: New or Classic */}
      <div className='mx-auto mb-8'>
        <p className='pb-2 text-base context-question'>
          Are you in the mood for something new or a classic?
        </p>
        <div className='flex gap-4'>
          {['New', 'Classic'].map((option) => (
            <button
              type='button'
              key={option}
              onClick={() => setNewOrClassic(option)}
              className={`bg-[#3B4877] text-white rounded-md px-4 py-2 text-base context-answer font-medium hover:bg-[#4a5689] transition-all ${
                newOrClassic === option ? 'ring-2 ring-[#51E08A]' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <input
          type='hidden'
          name='Are you in the mood for something new or a classic?'
          value={newOrClassic}
          required
        />
      </div>

      {/* Question 3: Mood */}
      <div className='mx-auto mb-8'>
        <p className='pb-2 text-base context-question'>
          What are you in the mood for?
        </p>
        <div className='flex gap-4'>
          {['Fun', 'Serious', 'Inspiring', 'Scary'].map((option) => (
            <button
              type='button'
              key={option}
              onClick={() => {
                if (mood.includes(option)) {
                  setMood(mood.filter((m) => m !== option));
                } else {
                  setMood([...mood, option]);
                }
              }}
              className={`bg-[#3B4877] text-white rounded-md px-4 py-2 text-base context-answer font-medium hover:bg-[#4a5689] transition-all ${
                mood.includes(option) ? 'ring-2 ring-[#51E08A]' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <input
          type='hidden'
          name='What are you in the mood for?'
          value={mood}
          required
        />
      </div>

      {/* Question 4: Famous Person */}
      <div className='mx-auto mb-8'>
        <p className='pb-2 text-base context-question'>
          Which famous film person would you love to be stranded on an island
          with and why?
        </p>
        <input
          type='text'
          placeholder='Enter your answer here'
          name='Which famous film person would you love to be stranded on an island with and why?'
          value={famousPerson}
          onChange={(e) => setFamousPerson(e.target.value)}
          className='text-sm context-answer w-full bg-[#3B4877] rounded-md p-2 h-[100px]'
          required
        />
      </div>

      {/* Submit Button */}
      <div className='mx-auto mb-8'>
        <button
          type='submit'
          className='bg-[#51E08A] text-black px-4 py-2 rounded-md w-full text-[30px] submit-button'
          disabled={usingAI}
        >
          {currentPerson >= allowedNumberOfPeople ? 'Get Movie' : 'Next Person'}
        </button>
      </div>
    </form>
  );
};
