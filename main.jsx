import { useState } from 'react';
import logo from './assets/pop-choice.png';
import { Questions } from './Questions';

export const App = () => {
  const [usingAI, setUsingAI] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [collectedResponses, setCollectedResponses] = useState({});
  const [allowedNumberOfPeople, setAllowedNumberOfPeople] = useState(1);
  const [currentPerson, setCurrentPerson] = useState(1);
  const [showAiRecommendation, setShowAiRecommendation] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState({
    title: null,
    releaseYear: null,
    content: null,
    noMatchFromLLM: false
  });

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
    
      console.log(userResponses);
      console.log(stringifiedQueryAndResponses);

      const finalResponses = {...collectedResponses}
      finalResponses.peopleResponses.push({
        userResponses,
        stringifiedQueryAndResponses
      });
    
     console.log(finalResponses);
    // e.preventDefault();
    // setUsingAI(true);
    // const formData = new FormData(e.target);
    // const userQueryResponses = Object.fromEntries(formData);

    // const userResponses = Object.values(userQueryResponses).join(', ');
    // const stringifiedQueryAndResponses = Object.entries(userQueryResponses)
    //   .map(
    //     ([key, value], index) =>
    //       `Question ${index + 1}: ${key}\nAnswer: ${value}`
    //   )
    //   .join('\n\n');

    // try {
    //   const response = await fetch(
    //     'https://pop-choice-worker.hawitrial.workers.dev/',
    //     {
    //       method: 'POST',
    //       body: JSON.stringify({
    //         questionsAndAnswersString: stringifiedQueryAndResponses,
    //         userResponses: userResponses
    //       })
    //     }
    //   );
    //   const data = await response.json();

    //   console.log(data);

    //   setShowAiRecommendation(true);
    //   setAiRecommendation({
    //     title: data.title,
    //     releaseYear: data.releaseYear,
    //     content: data.content,
    //     noMatchFromLLM: data.noMatchFromLLM
    //   });
    //   setUsingAI(false);
    // } catch (error) {
    //   console.error('Error fetching data from API:', error);
    //   setUsingAI(false);
    //   throw error;
    // }
  };

  const handleGoAgain = () => {
    setShowAiRecommendation(false);
    setUsingAI(false);
    setAiRecommendation({
      title: null,
      releaseYear: null,
      content: null,
      noMatchFromLLM: false
    });
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
    
      console.log(userResponses);
      console.log(stringifiedQueryAndResponses);
      setCollectedResponses({
        ...collectedResponses,
        peopleResponses: [...collectedResponses?.peopleResponses ?? [],{
          userResponses,
        stringifiedQueryAndResponses
      }]
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
        numberOfPeople: initialMovieSetUpPreferences['how many people are you going to watch the movie with?'],
        time: `${initialMovieSetUpPreferences['how much time do you have?']} movie`
      }
    });
    setShowQuestions(true);
  };

  return (
    <div className=''>
      <div className='mt-[50px]'>
        <img
          src={logo}
          alt='Pop Choice'
          width='100px'
          height='100px'
          className='my-0 mx-auto'
        />
        <h1 id='pop-choice-title' className='text-[45px] font-bold text-center'>
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
            handleFinalMovieSelectionSubmit={handleFinalMovieSelectionSubmit}
            handleNextPerson={handleNextPerson}
            allowedNumberOfPeople={allowedNumberOfPeople}
            currentPerson={currentPerson}
            usingAI={usingAI}
          />
        )}
      </div>
    </div>
  );
};
