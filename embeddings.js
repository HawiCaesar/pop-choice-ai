import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
//import structuredMoviesArray from './content.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url'; // Add this import
import { dirname, join } from 'path'; // Add this import
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function main() {
  let document;
  try {
    // const response = await fetch('movies.txt')
    // document = await response.text()
    const filePath = join(__dirname, 'movies.txt');
    document = await readFile(filePath, 'utf-8');

    
  } catch (error) {
    console.error('Error fetching movies.txt:', error);
    process.exit(1);
  }

    console.log('Document type:', typeof document);
    console.log('Document length:', document.length);
  

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 250,
    chunkOverlap: 35
  });
  const chunkData = await splitter.splitText(document);
  console.log('Chunked data:', chunkData);

  let data;
  try {
    data = await Promise.all(
      chunkData.map(async (textChunk) => {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: textChunk,
          encoding_format: 'float'
        });
        return {
          content: textChunk,
          embedding: embeddingResponse.data[0].embedding
        };
      })
    );
  } catch (error) {
    console.error('Error creating embeddings:', error);
    process.exit(1);
  }
  // Insert content and embedding into Supabase
  try {
    console.log('Inserting data into Supabase...');
    // Insert content and embedding into Supabase
    const { error } = await supabase
      .from('popchoice_unstructured')
      .insert(data);
    if (error) {
      console.error('Error inserting data into Supabase:', error);
      process.exit(1);
    }
    console.log('Embedding and storing complete!');
  } catch (error) {
    console.error('Error inserting data into Supabase:', error);
    process.exit(1);
  }
  console.log('Embedding and storing complete!');
}

main().catch((error) => {
  console.error('Error in main:', error);
  process.exit(1);
});
