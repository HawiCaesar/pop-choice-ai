# Pop Choice
A movie recommendation app incorporating text chunking, AI embedding and AI chat like functionality

## Getting Started
Install the dependencies and run the project
```
npm install
npm start
```

## How to test the app.
- For Main requirements, look at content.js.
- Open the app and follow the questions and see if you get a movie from content.js

- For stretch goals, look at movies.txt
- (To be filled in, I'm working on it)



### Main requirements 
- Built from scratch ✅
- Followed figma design (more mobile friendly) ✅
- Make sure to
    - Use a vector database to embedding ✅ (used Cloudflare workers to call the supabase DB)
    - Use OpenAI API ✅ (used Cloudflare workers to call the OpenAI API)
    - use the movies array in content.js ✅
- Use any framework or library (I used React) ✅

### Stetch goals
- Make app for N+ people, (TODO, working on limiting to 10 people max)
- Multiple choice questions ✅
- Use text chunking from movies.txt ✅
- Show a movie poster (use this API, https://developer.themoviedb.org/docs/getting-started) ✅
- Add "Next Movie" button for next recommendation. ✅

Head over to https://vitejs.dev/ to learn more about configuring vite
