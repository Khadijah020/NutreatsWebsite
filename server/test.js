// test-gemini. js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyB2cZQd4Fya51XHxiW8inY1Q4LLXb_79ak');

async function test() {
  const modelsToTry = [
    'gemini-1.5-flash-8b',  // Lighter model, better for free tier
    'gemini-2.0-flash-exp',  // Experimental but might work
    'gemini-2.5-flash',      // Latest but might be overloaded
    'gemini-1.5-flash',      // Previous version
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTrying ${modelName}...`);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello in a friendly way!');
      
      console.log('✅ Success with:', modelName);
      console.log('Response:', result.response.text());
      console.log('\n✨ Use this model in your controller!');
      break;
    } catch (error) {
      console.log('❌ Failed:', error.message.split('\n')[0].substring(0, 150));
    }
  }
}

test();