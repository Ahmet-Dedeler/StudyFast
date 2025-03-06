const { OpenAI } = require('openai');
const { getApiKey } = require('../utils');

// Define the request body type in JSDoc for documentation
/**
 * @typedef {Object} UserProfile
 * @property {'high_school' | 'university' | 'professional'} educationLevel
 * @property {string} learningStyle
 * @property {string[]} interests
 * @property {string} additionalInfo
 * 
 * @typedef {Object} RequestBody
 * @property {string} message
 * @property {string} modelId
 * @property {string} systemPrompt
 * @property {UserProfile | null} [userProfile]
 * @property {boolean} usesCompletionTokens
 */

/**
 * Handler function for the chat API endpoint
 * @param {import('@vercel/node').VercelRequest} request
 * @param {import('@vercel/node').VercelResponse} response
 */
module.exports = async function handler(request, response) {
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

  // Only allow POST requests
  if (request.method !== 'POST') {
    console.log(`Received ${request.method} request, only POST allowed`);
    return response.status(405).json({ 
      error: 'Method not allowed',
      method: request.method
    });
  }

  try {
    // Check if API key is set
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return response.status(500).json({ 
        error: 'Server configuration error: API key is not set',
        env: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY')).join(', ')
      });
    }

    // Parse and validate request body
    const body = request.body;
    console.log('Received request body:', JSON.stringify(body, null, 2));
    
    if (!body) {
      return response.status(400).json({ error: 'Request body is empty' });
    }
    
    const { message, modelId, systemPrompt, userProfile, usesCompletionTokens } = body;
    
    // Log the model and token parameter info for debugging
    console.log(`Model: ${modelId}, Uses completion tokens: ${usesCompletionTokens}`);

    // Validate required fields
    if (!message) {
      return response.status(400).json({ error: 'message is required' });
    }
    if (!modelId) {
      return response.status(400).json({ error: 'modelId is required' });
    }
    if (!systemPrompt) {
      return response.status(400).json({ error: 'systemPrompt is required' });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Add user profile context to system prompt if available
    let enhancedSystemPrompt = systemPrompt;
    if (userProfile) {
      enhancedSystemPrompt += `\n\nStudent Context:\n- Education Level: ${userProfile.educationLevel}\n- Learning Style: ${userProfile.learningStyle}\n- Interests: ${userProfile.interests.join(', ')}\n- Additional Info: ${userProfile.additionalInfo}`;
    }

    console.log(`Calling OpenAI API with model: ${modelId}`);
    try {
      // Determine if we need to use special parameters for o1 and o3-mini models
      const isSpecialModel = modelId === 'o1' || modelId === 'o3-mini' || usesCompletionTokens === true;
      
      // Create the request options
      const requestOptions = {
        model: modelId,
        messages: [
          {
            // Use "developer" role for o1 and o3-mini models, "system" for others
            role: isSpecialModel ? "developer" : "system",
            content: enhancedSystemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        // Set response format to text for all models
        response_format: { type: "text" }
      };
      
      // Add temperature only for non-special models
      if (!isSpecialModel) {
        requestOptions.temperature = 0.7;
      }
      
      // Add the appropriate token parameter based on the model
      if (isSpecialModel) {
        console.log('Using max_completion_tokens parameter and developer role for this model');
        requestOptions.max_completion_tokens = 800;
      } else {
        console.log('Using max_tokens parameter and system role for this model');
        requestOptions.max_tokens = 800;
      }
      
      console.log('OpenAI request options:', JSON.stringify(requestOptions, null, 2));
      
      const openaiResponse = await openai.chat.completions.create(requestOptions);

      const responseContent = openaiResponse.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
      console.log('Successfully received response from OpenAI');
      
      // Return the response
      return response.status(200).json({
        content: responseContent,
      });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      // Check if this is a parameter error and try again with the correct parameter
      if (openaiError.message) {
        console.log('Error message:', openaiError.message);
        
        // If there's an error about temperature
        if (openaiError.message.includes('temperature')) {
          console.log('Detected temperature parameter error, retrying without temperature');
          
          try {
            // Create new request options without temperature
            const retryRequestOptions = {
              model: modelId,
              messages: [
                {
                  role: isSpecialModel ? "developer" : "system",
                  content: enhancedSystemPrompt,
                },
                {
                  role: 'user',
                  content: message,
                },
              ],
              response_format: { type: "text" }
            };
            
            // Add the appropriate token parameter
            if (isSpecialModel) {
              retryRequestOptions.max_completion_tokens = 800;
            } else {
              retryRequestOptions.max_tokens = 800;
              retryRequestOptions.temperature = 0.7; // Only add for non-special models
            }
            
            console.log('Retry request options:', JSON.stringify(retryRequestOptions, null, 2));
            
            const retryResponse = await openai.chat.completions.create(retryRequestOptions);
            
            const retryContent = retryResponse.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
            console.log('Successfully received response from OpenAI on retry');
            
            return response.status(200).json({
              content: retryContent,
            });
          } catch (retryError) {
            console.error('Retry also failed:', retryError);
            return response.status(500).json({
              error: 'OpenAI API error on retry',
              message: retryError.message,
              type: retryError.type,
              code: retryError.code
            });
          }
        }
        
        // If there's an error about max_tokens vs max_completion_tokens
        else if (openaiError.message.includes('max_tokens') && openaiError.message.includes('max_completion_tokens')) {
          console.log('Detected token parameter error, retrying with max_completion_tokens');
          
          try {
            // Create new request options with the correct parameter
            const retryRequestOptions = {
              model: modelId,
              messages: [
                {
                  role: "developer", // Always use developer for retry
                  content: enhancedSystemPrompt,
                },
                {
                  role: 'user',
                  content: message,
                },
              ],
              max_completion_tokens: 800,
              response_format: { type: "text" }
              // No temperature for special models
            };
            
            console.log('Retry request options:', JSON.stringify(retryRequestOptions, null, 2));
            
            const retryResponse = await openai.chat.completions.create(retryRequestOptions);
            
            const retryContent = retryResponse.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
            console.log('Successfully received response from OpenAI on retry');
            
            return response.status(200).json({
              content: retryContent,
            });
          } catch (retryError) {
            console.error('Retry also failed:', retryError);
            return response.status(500).json({
              error: 'OpenAI API error on retry',
              message: retryError.message,
              type: retryError.type,
              code: retryError.code
            });
          }
        }
        
        // If there's an error about system vs developer role
        else if (openaiError.message.includes('system') && openaiError.message.includes('developer')) {
          console.log('Detected role error, retrying with developer role');
          
          try {
            // Create new request options with the correct role
            const retryRequestOptions = {
              model: modelId,
              messages: [
                {
                  role: "developer", // Use developer role
                  content: enhancedSystemPrompt,
                },
                {
                  role: 'user',
                  content: message,
                },
              ],
              response_format: { type: "text" }
              // No temperature for special models
            };
            
            // Add the appropriate token parameter
            if (isSpecialModel) {
              retryRequestOptions.max_completion_tokens = 800;
            } else {
              retryRequestOptions.max_tokens = 800;
              retryRequestOptions.temperature = 0.7; // Only add for non-special models
            }
            
            console.log('Retry request options:', JSON.stringify(retryRequestOptions, null, 2));
            
            const retryResponse = await openai.chat.completions.create(retryRequestOptions);
            
            const retryContent = retryResponse.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
            console.log('Successfully received response from OpenAI on retry');
            
            return response.status(200).json({
              content: retryContent,
            });
          } catch (retryError) {
            console.error('Retry also failed:', retryError);
            return response.status(500).json({
              error: 'OpenAI API error on retry',
              message: retryError.message,
              type: retryError.type,
              code: retryError.code
            });
          }
        }
      }
      
      return response.status(500).json({
        error: 'OpenAI API error',
        message: openaiError.message,
        type: openaiError.type,
        code: openaiError.code
      });
    }
  } catch (error) {
    console.error('Unexpected error processing request:', error);
    return response.status(500).json({
      error: 'An unexpected error occurred while processing your request',
      message: error.message
    });
  }
} 