/**
 * Handler function for the test API endpoint
 * @param {import('@vercel/node').VercelRequest} request
 * @param {import('@vercel/node').VercelResponse} response
 */
module.exports = function handler(request, response) {
  console.log('Test endpoint called with method:', request.method);
  
  // Set CORS headers - important for cross-origin requests
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for CORS preflight');
    return response.status(200).end();
  }

  // Log request details
  console.log('Request headers:', request.headers);
  
  try {
    // Return environment info (excluding sensitive data)
    const envInfo = Object.keys(process.env)
      .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('TOKEN'))
      .reduce((obj, key) => {
        obj[key] = process.env[key];
        return obj;
      }, {});

    // Check OpenAI API key configuration
    const apiKeyConfigured = !!process.env.OPENAI_API_KEY;
    console.log('OpenAI API key configured:', apiKeyConfigured);
    
    // Return basic server info
    return response.status(200).json({
      status: 'ok',
      message: 'StudyFast API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      apiKeyConfigured,
      nodeVersion: process.version,
      env: envInfo,
      cors: {
        allowOrigin: '*',
        allowMethods: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        allowCredentials: true
      },
      request: {
        method: request.method,
        url: request.url,
        headers: {
          origin: request.headers.origin,
          referer: request.headers.referer,
          'user-agent': request.headers['user-agent'],
          'content-type': request.headers['content-type'],
        }
      }
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return response.status(500).json({
      error: 'An error occurred in the test endpoint',
      message: error.message
    });
  }
} 