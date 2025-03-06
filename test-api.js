// Simple script to test the StudyFast API
import fetch from 'node-fetch';

const API_URL = 'https://studyfast-api.vercel.app/api/chat';
const TEST_URL = 'https://studyfast-api.vercel.app/api/test';

async function testStatusEndpoint() {
  console.log('Testing status endpoint...');
  try {
    const response = await fetch(TEST_URL);
    console.log('Status response status:', response.status);
    console.log('Status response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Raw response text:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Parsed JSON:', data);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError.message);
    }
    
    return text;
  } catch (error) {
    console.error('Error testing status endpoint:', error);
    return null;
  }
}

async function testChatEndpoint() {
  console.log('\nTesting chat endpoint...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, can you help me study?',
        modelId: 'gpt-4o',
        systemPrompt: 'You are a helpful AI assistant.',
      }),
    });
    
    console.log('Chat response status:', response.status);
    console.log('Chat response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Raw response text:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Parsed JSON:', data);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError.message);
    }
    
    return text;
  } catch (error) {
    console.error('Error testing chat endpoint:', error);
    return null;
  }
}

async function runTests() {
  console.log('Starting API tests for', API_URL);
  
  // Test status endpoint
  await testStatusEndpoint();
  
  // Test chat endpoint
  await testChatEndpoint();
  
  console.log('\nTests completed');
}

runTests(); 