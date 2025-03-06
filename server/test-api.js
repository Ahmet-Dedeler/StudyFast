// Simple script to test the StudyFast API
const fetch = require('node-fetch');

// API URLs to test
const BASE_URL = 'https://studyfast-api.vercel.app';
const TEST_URL = `${BASE_URL}/api/test`;
const CHAT_URL = `${BASE_URL}/api/chat`;

async function testStatusEndpoint() {
  console.log('\n--- Testing Status Endpoint ---');
  console.log(`URL: ${TEST_URL}`);
  
  try {
    const response = await fetch(TEST_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'StudyFast-API-Tester/1.0',
        'Origin': 'https://studyfast-test.com' // Testing CORS with a fake origin
      }
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:');
    
    // Log all headers
    const headers = {};
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
      headers[name] = value;
    });
    
    // Check for CORS headers
    const corsHeaderPresent = response.headers.has('access-control-allow-origin');
    console.log('\nCORS Headers Present:', corsHeaderPresent);
    
    if (corsHeaderPresent) {
      console.log('  Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
    } else {
      console.log('  WARNING: No CORS headers found in response!');
    }
    
    // Parse response body
    const text = await response.text();
    console.log('\nResponse Body:');
    
    try {
      const data = JSON.parse(text);
      console.log(JSON.stringify(data, null, 2));
      return data;
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError.message);
      console.log('Raw response text:', text);
      return null;
    }
  } catch (error) {
    console.error('Error testing status endpoint:', error);
    return null;
  }
}

async function testPreflightCORS() {
  console.log('\n--- Testing Preflight CORS Request ---');
  console.log(`URL: ${CHAT_URL}`);
  
  try {
    // Make an OPTIONS request to simulate preflight
    const response = await fetch(CHAT_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5500',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('Preflight Response Status:', response.status);
    console.log('Preflight Response Headers:');
    
    // Log all headers
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    // Check for CORS headers
    const corsHeaderPresent = response.headers.has('access-control-allow-origin');
    console.log('\nCORS Headers Present:', corsHeaderPresent);
    
    if (corsHeaderPresent) {
      console.log('  Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
      console.log('  Access-Control-Allow-Methods:', response.headers.get('access-control-allow-methods'));
      console.log('  Access-Control-Allow-Headers:', response.headers.get('access-control-allow-headers'));
    } else {
      console.log('  WARNING: No CORS headers found in preflight response!');
    }
    
    return response.status === 200;
  } catch (error) {
    console.error('Error testing preflight CORS:', error);
    return false;
  }
}

async function testChatEndpoint() {
  console.log('\n--- Testing Chat Endpoint ---');
  console.log(`URL: ${CHAT_URL}`);
  
  try {
    const payload = {
      message: 'Hello, can you help me study?',
      modelId: 'gpt-4o',
      systemPrompt: 'You are a helpful AI assistant.'
    };
    
    console.log('Request Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'StudyFast-API-Tester/1.0',
        'Origin': 'http://localhost:5500' // Simulating local development
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:');
    
    // Log all headers
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    // Check for CORS headers
    const corsHeaderPresent = response.headers.has('access-control-allow-origin');
    console.log('\nCORS Headers Present:', corsHeaderPresent);
    
    // Parse response body
    const text = await response.text();
    console.log('\nResponse Body:');
    
    try {
      const data = JSON.parse(text);
      console.log(JSON.stringify(data, null, 2));
      return data;
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError.message);
      console.log('Raw response text:', text);
      return null;
    }
  } catch (error) {
    console.error('Error testing chat endpoint:', error);
    return null;
  }
}

async function runTests() {
  console.log('Starting API tests for StudyFast API');
  console.log('Base URL:', BASE_URL);
  console.log('Time:', new Date().toISOString());
  console.log('-----------------------------------');
  
  // Test status endpoint
  await testStatusEndpoint();
  
  // Test preflight CORS request
  await testPreflightCORS();
  
  // Test chat endpoint
  await testChatEndpoint();
  
  console.log('\n--- Tests Completed ---');
}

// Run the tests
runTests(); 