import axios from 'axios';

// Base URL for DeepSeek API
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';

// Function to create a chat completion with DeepSeek
export async function createDeepSeekChatCompletion(
  messages: any[], 
  model: string, 
  apiKey: string,
  options?: {
    temperature?: number;
    max_tokens?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
  }
) {
  try {
    const response = await axios.post(
      `${DEEPSEEK_API_URL}/chat/completions`,
      {
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens,
        presence_penalty: options?.presence_penalty,
        frequency_penalty: options?.frequency_penalty,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error(`DeepSeek API Error: ${error.message}`);
    
    // Enhanced error messages for common issues
    let errorMessage = `DeepSeek Error: ${error.response?.data?.error?.message || error.message}`;
    
    // Check for specific error responses
    if (error.response?.data?.error?.message === "Model Not Exist") {
      errorMessage = `DeepSeek Error: The model "${model}" was not found or is not available with your account.`;
    } else if (error.response?.status === 401) {
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

// Function to validate a DeepSeek API key
export function validateDeepSeekApiKey(apiKey: string): boolean {
  // Basic validation - DeepSeek API keys start with 'sk-' and are typically 32+ characters
  // Note: We're allowing 32+ characters to accommodate different DeepSeek key formats
  return apiKey.startsWith('sk-') && apiKey.length >= 32;
}

// Function to check if the API key is valid by making a simple test request
export async function verifyDeepSeekApiKey(apiKey: string): Promise<boolean> {
  try {
    console.log(`Attempting to verify DeepSeek API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    
    const response = await axios.get(
      `${DEEPSEEK_API_URL}/models`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 5000 // Add a timeout to avoid long waiting times
      }
    );
    
    console.log('DeepSeek API response status:', response.status);
    return response.status === 200;
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('DeepSeek API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('DeepSeek API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('DeepSeek API Request Setup Error:', error.message);
    }
    return false;
  }
}