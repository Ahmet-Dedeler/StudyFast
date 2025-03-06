const fetch = require('node-fetch');

// Test with our local mock API
const TEST_API_URL = 'http://localhost:3000/api/chat';
const TEST_STATUS_URL = 'http://localhost:3000/api/test';

// Test data
const testData = {
  message: "What is the capital of France?",
  modelId: "gpt-4o",
  systemPrompt: "You are a helpful teacher. Keep your answers brief and to the point."
};

async function testStatusEndpoint() {
  console.log('Testing status endpoint:', TEST_STATUS_URL);
  
  try {
    const response = await fetch(TEST_STATUS_URL);
    console.log('Status response status:', response.status);
    
    const data = await response.json();
    console.log('Status response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Status endpoint test successful!');
    } else {
      console.log('❌ Status endpoint test failed!');
    }
  } catch (error) {
    console.error('Error testing status endpoint:', error.message);
    console.log('❌ Status endpoint test failed!');
  }
}

async function testChatEndpoint() {
  console.log('\nTesting chat endpoint:', TEST_API_URL);
  console.log('Sending test data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch(TEST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Chat response status:', response.status);
    
    const data = await response.json();
    console.log('Chat response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Chat endpoint test successful!');
    } else {
      console.log('❌ Chat endpoint test failed!');
    }
  } catch (error) {
    console.error('Error testing chat endpoint:', error.message);
    console.log('❌ Chat endpoint test failed!');
  }
}

async function runTests() {
  await testStatusEndpoint();
  await testChatEndpoint();
}

runTests(); 