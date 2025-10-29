import { useState } from 'react';
import { openai, supabase } from './config.js';
import logo from './assets/pop-choice.png';

export const App = () => {
  const [usingAI, setUsingAI] = useState(false);
  const [showAiRecommendation, setShowAiRecommendation] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState({
    title: null,
    releaseYear: null,
    content: null
  });

  const performSemanticSearch = async (userResponses) => {
    let embedding;
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: userResponses,
        encoding_format: 'float'
      });
      embedding = embeddingResponse.data[0].embedding;
      console.log(embedding);
    } catch (error) {
      console.error('Error creating embeddings for query:', error);
    }

    try {
      const { error, data } = await supabase.rpc('match_popchoice', {
        query_embedding: embedding,
        match_threshold: 0.02, // low threshold for more matches
        match_count: 1 // only return 1 match as per core requirements
      });

      if (error) {
        console.error('Error matching documents:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error matching documents:', error);
      throw error;
    }
  };

  const useAILanguageModel = async (
    embeddingResponse,
    queryAndResponsesStringified
  ) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert movie buff and a recommendation buddy who enjoys helping people find movies that match their preferences. 
            You will be given 3 questions from the user and their answers. 
            You will also be given a movie the most aligns to their preference based on their answers.
            Your main job is to formulate a short answer to the questios using the provided questions and answers and the movie recommendation and more details about the movie. 
            If you are unsure and cannot find the users answers or have no movie recommendation or more details about the movie, say, "Sorry, I don't know a movie at the moment. Lets have another go with the questions from the previous section
            ." Please do not make up the answer. Also dont repeat the users answers.
            `
          },
          {
            role: 'user',
            content: `Questions and Answers: ${queryAndResponsesStringified}\n Movie Recommendation: ${embeddingResponse.title} ${embeddingResponse.releaseYear} ${embeddingResponse.content}`
          }
        ]
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error using AI language model:', error);
      return null;
    }
  };

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

    const results = await performSemanticSearch(userResponses);
    const aiResponse = await useAILanguageModel(
      results[0],
      stringifiedQueryAndResponses
    );
    console.log(results[0]);
    setShowAiRecommendation(true);
    setAiRecommendation({
      title: results[0].title,
      releaseYear: results[0].releaseyear,
      content: aiResponse
    });
    setUsingAI(false);
  };

  const handleGoAgain = () => {
    setShowAiRecommendation(false);
    setUsingAI(false);
    setAiRecommendation({
      title: null,
      releaseYear: null,
      content: null
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
            <p className='text-[30px] font-bold text-center'>{aiRecommendation.title} ({aiRecommendation.releaseYear})</p>
            <p className='pb-2 text-base context-question'>
              {aiRecommendation.content}
            </p>
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
