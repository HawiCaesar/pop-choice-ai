import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from "@supabase/supabase-js";
import structuredMoviesArray from './content.js';

// Load environment variables
dotenv.config();

console.log('Environment check:', {
  OPENAI_KEY: !!process.env.VITE_OPENAI_API_KEY,
  SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: !!process.env.VITE_SUPABASE_API_KEY
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_API_KEY
);

async function main(input) {
  console.log('Starting embedding process...');
  let data;
  try {
    data = await Promise.all(
    input.map( async (textChunk) => {
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: textChunk.content,
            encoding_format: "float",
        });
        return { 
          title: textChunk.title,
          releaseyear: textChunk.releaseYear, // Supabase column name is releaseyear
          content: textChunk.content,
          embedding: embeddingResponse.data[0].embedding 
        }
      })
    );
    console.log('Done with embeddings');
  } catch (error) {
    console.error('Error creating embeddings:', error);
    process.exit(1);
  }
  
  try {
    console.log('Inserting data into Supabase...');
    // Insert content and embedding into Supabase
    const { error } = await supabase.from('popchoice').insert(data); 
    if (error) {
      console.error('Error inserting data into Supabase:', error);
      process.exit(1);
    }
    console.log('Embedding and storing complete!');
  } catch (error) {
    console.error('Error inserting data into Supabase:', error);
    process.exit(1);
  }
}

main(structuredMoviesArray).catch(error => {
  console.error('Error in main:', error);
  process.exit(1);
});