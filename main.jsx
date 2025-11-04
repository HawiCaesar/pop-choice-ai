import { useState } from 'react';
import logo from './assets/pop-choice.png';
import { Questions } from './Questions';
import { Recommendations } from './Recommendations';

export const App = () => {
  const [usingAI, setUsingAI] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [collectedResponses, setCollectedResponses] = useState({});
  const [allowedNumberOfPeople, setAllowedNumberOfPeople] = useState(1);
  const [currentPerson, setCurrentPerson] = useState(1);
  const [showAiRecommendations, setShowAiRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);

  const handleFinalMovieSelectionSubmit = async (e) => {
    setUsingAI(true);

    const formData = new FormData(e.target);
    const userQueryResponses = Object.fromEntries(formData);

    const userResponses = Object.values(userQueryResponses).join(', ');
    const stringifiedQueryAndResponses = Object.entries(userQueryResponses)
      .map(
        ([key, value], index) =>
          `Question ${index + 1}: ${key}\nAnswer: ${value}`
      )
      .join('\n\n');

    const finalResponses = { ...collectedResponses };
    finalResponses.peopleResponses.push({
      userResponses,
      stringifiedQueryAndResponses: `Person ${currentPerson}: \n\n ${stringifiedQueryAndResponses}`
    });

    console.log(finalResponses);

    // loggin in to themoviedb API
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/authentication`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_THEMOVIEDB_API_KEY}`
          }
        }
      );
      await response.json();
    } catch (error) {
      console.error('Error logging in to themoviedb API:', error);

      throw error;
    }

    try {
      const response = await fetch(
        'https://pop-choice-worker.hawitrial.workers.dev/',
        {
          method: 'POST',
          body: JSON.stringify({
            movieSetUpPreferences: collectedResponses.movieSetUpPreferences,
            peopleResponses: collectedResponses.peopleResponses
          })
        }
      );
      const data = await response.json();

      console.log(JSON.parse(data.content).movieRecommendations)

      setShowAiRecommendations(true);
      setAiRecommendations(JSON.parse(data.content).movieRecommendations);
      setUsingAI(false);
    } catch (error) {
      console.error('Error fetching data from API:', error);
      setUsingAI(false);
      throw error;
    }
  };

  const handleGoAgain = () => {
    setShowAiRecommendations(false);
    setUsingAI(false);
    setAiRecommendations([]);
    setCurrentPerson(1);
    setShowQuestions(false);
  };

  const handleNextPerson = (e) => {
    const formData = new FormData(e.target);
    const userQueryResponses = Object.fromEntries(formData);

    const userResponses = Object.values(userQueryResponses).join(', ');
    const stringifiedQueryAndResponses = Object.entries(userQueryResponses)
      .map(
        ([key, value], index) =>
          `Question ${index + 1}: ${key}\nAnswer: ${value}`
      )
      .join('\n\n');

    
    setCollectedResponses({
      ...collectedResponses,
      peopleResponses: [
        ...(collectedResponses?.peopleResponses ?? []),
        {
          userResponses,
          stringifiedQueryAndResponses: `Person ${currentPerson}: \n\n ${stringifiedQueryAndResponses}`
        }
      ]
    });
    setCurrentPerson(currentPerson + 1);
  };

  const onHandleStart = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const initialMovieSetUpPreferences = Object.fromEntries(formData);

    setAllowedNumberOfPeople(
      initialMovieSetUpPreferences[
        'how many people are you going to watch the movie with?'
      ]
    );
    const stringifiedQueryAndResponsesForInitialSetUp = Object.entries(
      initialMovieSetUpPreferences
    )
      .map(
        ([key, value], index) =>
          `Question ${index + 1}: ${key}\nAnswer: ${value}`
      )
      .join('\n\n');

    setCollectedResponses({
      movieSetUpPreferences: {
        stringifiedQueryAndResponsesForInitialSetUp,
        numberOfPeople:
          initialMovieSetUpPreferences[
            'how many people are you going to watch the movie with?'
          ],
        time: `Runtime: ${initialMovieSetUpPreferences['how much time do you have?']} available`
      }
    });
    setShowQuestions(true);
  };

  return (
    <div className=''>
      {showAiRecommendations ? (
        <Recommendations
          movieRecommendations={aiRecommendations}
          handleGoAgain={handleGoAgain}
        />
      ) : (
        <>
          <div className='mt-[50px]'>
            <img
              src={logo}
              alt='Pop Choice'
              width='100px'
              height='100px'
              className='my-0 mx-auto'
            />
            <h1
              id='pop-choice-title'
              className='text-[45px] font-bold text-center'
            >
              {showQuestions ? currentPerson : 'Pop Choice'}
            </h1>
          </div>

          <div className='mt-2 p-8'>
            {!showQuestions ? (
              <form onSubmit={onHandleStart}>
                <input
                  placeholder='How many people are you going to watch the movie with?'
                  name='how many people are you going to watch the movie with?'
                  className='text-sm text-center context-answer w-full bg-[#3B4877] rounded-md p-2 mb-6 h-[60px]'
                  required
                />
                <input
                  placeholder='How much time do you have?'
                  name='how much time do you have?'
                  className='text-sm text-center context-answer w-full bg-[#3B4877] rounded-md p-2 mb-6 h-[60px]'
                  required
                />
                <button
                  type='submit'
                  className='bg-[#51E08A] text-black px-4 py-2 rounded-md w-full text-[30px] submit-button'
                >
                  Start
                </button>
              </form>
            ) : (
              <Questions
                handleFinalMovieSelectionSubmit={
                  handleFinalMovieSelectionSubmit
                }
                handleNextPerson={handleNextPerson}
                allowedNumberOfPeople={allowedNumberOfPeople}
                currentPerson={currentPerson}
                usingAI={usingAI}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
