import axios from 'axios';

// Base URL for DeepSeek API - updated to match official documentation
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';

// Available models from DeepSeek
export const deepseekModels = [
  'deepseek-v3-base',  // Base model (default)
  'deepseek-v3-mini',  // Mini model (more efficient)
  'deepseek-v3-plus'   // Plus model (more powerful)
];

// Function to create a chat completion with DeepSeek
export async function createDeepSeekChatCompletion(
  messages: any[], 
  model: string = 'deepseek-v3-base', 
  apiKey: string,
  options?: {
    temperature?: number;
    max_tokens?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
  }
) {
  try {
    // Ensure model name is valid according to DeepSeek API
    const cleanModel = model.includes('/') ? model.split('/').pop() : model;
    
    // Format the API request body according to DeepSeek documentation
    const requestBody: any = {
      model: cleanModel,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2048,
      top_p: 0.95, // Default value per documentation
      stream: false // We don't want streaming
    };
    
    // Add optional parameters only if they are provided
    if (options?.presence_penalty !== undefined) {
      requestBody.presence_penalty = options.presence_penalty;
    }
    
    if (options?.frequency_penalty !== undefined) {
      requestBody.frequency_penalty = options.frequency_penalty;
    }
    
    console.log(`Making DeepSeek API request with model: ${cleanModel}`);
    
    const response = await axios.post(
      `${DEEPSEEK_API_URL}/chat/completions`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    console.log('DeepSeek API response received successfully');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error(`DeepSeek API Error: ${error.message}`);
    
    // Enhanced error messages for common issues
    let errorMessage = `DeepSeek Error: ${error.response?.data?.error?.message || error.message}`;
    
    // Check for specific error responses based on DeepSeek documentation
    if (error.response?.data?.error?.type === "invalid_request_error") {
      errorMessage = `DeepSeek Error: Invalid request - ${error.response?.data?.error?.message}`;
    } else if (error.response?.data?.error?.type === "authentication_error") {
      errorMessage = "DeepSeek Error: Invalid or expired API key.";
    } else if (error.response?.status === 429) {
      errorMessage = "DeepSeek Error: Rate limit exceeded or insufficient credits. Please try again later or add funds to your DeepSeek account.";
    } else if (error.message.includes("timeout")) {
      errorMessage = "DeepSeek Error: Request timed out. The DeepSeek API may be experiencing high traffic.";
    }
    
    return {
      success: false,
      error: {
        message: errorMessage,
        status: error.response?.status || 500
      }
    };
  }
}

// Function to validate a DeepSeek API key format
export function validateDeepSeekApiKey(apiKey: string): boolean {
  // DeepSeek API keys start with 'sk-' and are 32+ characters
  return apiKey.startsWith('sk-') && apiKey.length >= 32;
}

// Function to check if the API key is valid by making a simple test request
export async function verifyDeepSeekApiKey(apiKey: string): Promise<boolean> {
  try {
    // Only show the first 5 and last 4 characters of the API key for security
    console.log(`Verifying DeepSeek API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Use the models endpoint to verify API key validity
    const response = await axios.get(
      `${DEEPSEEK_API_URL}/models`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000 // Add a timeout to avoid long waiting times
      }
    );
    
    console.log('DeepSeek API verification successful:', response.status === 200);
    return response.status === 200;
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with an error
      console.error('DeepSeek API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('DeepSeek API No Response Error');
    } else {
      // Something happened in setting up the request
      console.error('DeepSeek API Request Setup Error:', error.message);
    }
    return false;
  }
}