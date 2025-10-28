import { useState, useEffect } from 'react';
import { openai, supabase } from './config.js';
import logo from './assets/pop-choice.png';

const checkIfTableExists = async () => {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('popchoice')
    .eq('table_schema', 'public')
    .eq('table_name', 'popchoice');
  if (error) {
    console.error(error);
    return false;
  }
  return data.length > 0;
};

export const App = () => {
  const [usingAI, setUsingAI] = useState(false);
  

  const handleSubmit = (e) => {
    e.preventDefault();
    setUsingAI(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log(data);
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
        <form onSubmit={handleSubmit}>
          <div className='mx-auto mb-8'>
            <p className='pb-2 text-base context-question'>
              What's your favorite movie and why?
            </p>
            <textarea
              placeholder='Enter your answer here'
              name='favorite-movie-and-why'
              className='text-sm context-answer w-full bg-[#3B4877] rounded-md p-2 h-[100px]'
            />
          </div>
          <div className='mx-auto mb-8'>
            <p className='pb-2 text-base context-question'>
              Are you in the mood for something new or a classic?
            </p>
            <textarea
              placeholder='Enter your answer here'
              name='mood-new-or-classic'
              className='text-sm context-answer w-full bg-[#3B4877] rounded-md p-2 h-[100px]'
            />
          </div>

          <div className='mx-auto mb-8'>
            <p className='pb-2 text-base context-question'>
              Do you wanna have fun or do you want something serious?
            </p>
            <textarea
              placeholder='Enter your answer here'
              name='fun-or-serious'
              className='text-sm context-answer w-full bg-[#3B4877] rounded-md p-2 h-[100px]'
            />
          </div>

          <div className='mx-auto mb-8'>
            <button
              type='submit'
              disabled={usingAI}
              className='bg-[#51E08A] text-black px-4 py-2 rounded-md w-full text-[30px] submit-button'
            >
              Let's Go
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
