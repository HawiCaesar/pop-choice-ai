import { useState } from 'react';
import logo from './assets/pop-choice.png';

export const App = () => {
  const [usingAI, setUsingAI] = useState(false);
  const [showAiRecommendation, setShowAiRecommendation] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState({
    title: null,
    releaseYear: null,
    content: null,
    noMatchFromLLM: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    try {
      const response = await fetch(
        'https://pop-choice-worker.hawitrial.workers.dev/',
        {
          method: 'POST',
          body: JSON.stringify({
            questionsAndAnswersString: stringifiedQueryAndResponses,
            userResponses: userResponses
          })
        }
      );
      const data = await response.json();


      console.log(data);

      setShowAiRecommendation(true);
      setAiRecommendation({
        title: data.title,
        releaseYear: data.releaseYear,
        content: data.content,
        noMatchFromLLM: data.noMatchFromLLM
      });
      setUsingAI(false);
    } catch (error) {
      console.error('Error fetching data from API:', error);
      setUsingAI(false);
      throw error;
    }
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
          Pop Choice
        </h1>
      </div>

      <div className='mt-2 p-8'>
        {showAiRecommendation ? (
          <div className='mx-auto mb-8'>
            {aiRecommendation.noMatchFromLLM ? (
              <p className='text-[30px] font-bold text-center'>
              Sorry, I don't know any movie based on your preferences. Click the button below to try again.
              </p>
            ) : (
              <>
                <p className='text-[30px] mb-6 font-bold text-center'>
                  {aiRecommendation.title} ({aiRecommendation.releaseYear})
                </p>
                <p className='pb-2 text-base context-question'>
                  {aiRecommendation.content}
                </p>
              </>
            )}
            <button
              type='button'
              className='bg-[#51E08A] text-black px-4 py-2 mt-16 rounded-md w-full text-[30px] submit-button'
              onClick={handleGoAgain}
            >
              Go Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className='mx-auto mb-8'>
              <p className='pb-2 text-base context-question'>
                What's your favorite movie and why?
              </p>
              <textarea
                placeholder='Enter your answer here'
                name="What's your favorite movie and why?"
                className='text-sm context-answer w-full bg-[#3B4877] rounded-md p-2 h-[100px]'
                required
              />
            </div>
            <div className='mx-auto mb-8'>
              <p className='pb-2 text-base context-question'>
                Are you in the mood for something new or a classic?
              </p>
              <textarea
                placeholder='Enter your answer here'
                name='Are you in the mood for something new or a classic?'
                className='text-sm context-answer w-full bg-[#3B4877] rounded-md p-2 h-[100px]'
                required
              />
            </div>

            <div className='mx-auto mb-8'>
              <p className='pb-2 text-base context-question'>
                Do you wanna have fun or do you want something serious?
              </p>
              <textarea
                placeholder='Enter your answer here'
                name='Do you wanna have fun or do you want something serious?'
                className='text-sm context-answer w-full bg-[#3B4877] rounded-md p-2 h-[100px]'
                required
              />
            </div>

            <div className='mx-auto mb-8'>
              <button
                type='submit'
                disabled={usingAI}
                className='bg-[#51E08A] text-black px-4 py-2 rounded-md w-full text-[30px] submit-button'
              >
                {usingAI ? 'Searching...' : "Let's Go"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
