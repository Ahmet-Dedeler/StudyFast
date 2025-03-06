const fetch = require('node-fetch');

// Test with a public API that doesn't require authentication
const TEST_API_URL = 'https://httpbin.org/post';

// Test data
const testData = {
  message: "What is the capital of France?",
  modelId: "gpt-4o",
  systemPrompt: "You are a helpful teacher. Keep your answers brief and to the point."
};

async function testApi() {
  console.log('Testing API endpoint:', TEST_API_URL);
  console.log('Sending test data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch(TEST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ API test successful!');
      console.log('This confirms that your network and fetch functionality are working correctly.');
      console.log('If your actual API is not working, the issue is likely with:');
      console.log('1. The API deployment on Vercel');
      console.log('2. Missing environment variables (OPENAI_API_KEY)');
      console.log('3. CORS configuration');
    } else {
      console.log('❌ API test failed!');
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
    console.log('❌ API test failed!');
  }
}

testApi(); 