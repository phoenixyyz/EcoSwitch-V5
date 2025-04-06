import axios from 'axios';
import type { z } from 'zod';
import { insertMessageSchema } from '@shared/schema';

// Define our own MessageType for the server based on the insertMessageSchema
type MessageType = z.infer<typeof insertMessageSchema>;

// OpenRouter base URL
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

// Get OpenRouter API key from environment
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Default headers required for OpenRouter API
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://ecoswitch.replit.app',
  'X-Title': 'EcoSwitch AI',
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  // Add data policy header to allow all models to be accessed
  'OpenRouter-Data-Policy': 'allow'
};

// OpenRouter models - simplified to use only models that work with our key
export const openRouterModels = [
  'meta-llama/llama-3-8b-instruct',   // Llama 3 8B - widely supported
  'openai/gpt-3.5-turbo',            // OpenAI GPT-3.5 - reliable fallback
  'deepseek/deepseek-v3-base:free',  // DeepSeek v3 Base (free)
];

// Function to determine if we have a valid connection to OpenRouter
export async function verifyOpenRouterConnection(): Promise<boolean> {
  try {
    // Check if we have an environment API key
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.trim() === '') {
      console.log('No OpenRouter API key found in environment variables');
      return false;
    }
    
    // Make sure we have the right headers with the environment API key
    const headers = {
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ecoswitch.replit.app',
      'X-Title': 'EcoSwitch AI',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'OpenRouter-Data-Policy': 'allow'
    };
    
    console.log('Verifying OpenRouter connection with API key from environment');
    const response = await axios.get(`${OPENROUTER_API_URL}/models`, {
      headers: headers,
    });
    
    const isConnected = response.status === 200;
    console.log(`OpenRouter connection verified: ${isConnected}`);
    return isConnected;
  } catch (error: any) {
    console.error('Error verifying OpenRouter connection:', error);
    if (error.response) {
      console.error('OpenRouter API response error:', error.response.status, error.response.data);
    }
    return false;
  }
}

// Function to validate an OpenRouter API key
export async function verifyOpenRouterApiKey(apiKey: string): Promise<boolean> {
  try {
    if (!apiKey || apiKey.trim() === '') {
      return false;
    }
    
    // Basic format validation first
    // The format should start with sk-or- but can have various formats
    const openRouterKeyPattern = /^sk-or-/;
    if (!openRouterKeyPattern.test(apiKey)) {
      console.log('OpenRouter API key invalid format:', apiKey);
      return false;
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ecoswitch.replit.app',
      'X-Title': 'EcoSwitch AI',
      'Authorization': `Bearer ${apiKey}`,
      'OpenRouter-Data-Policy': 'allow'
    };
    
    // Try to make a real API call to verify the key
    const response = await axios.get(`${OPENROUTER_API_URL}/models`, {
      headers: headers,
    });
    
    console.log('OpenRouter API key validation successful');
    return response.status === 200;
  } catch (error: any) {
    console.error('Error validating OpenRouter API key:', error.message);
    return false;
  }
}

// Function to create a chat completion with OpenRouter
export async function createOpenRouterChatCompletion(
  model: string = 'meta-llama/llama-3-8b-instruct',
  messages: MessageType[],
  options: {
    temperature?: number;
    maxTokens?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    systemPrompt?: string;
    apiKey?: string; // For custom API key
  } = {}
) {
  try {
    // Format messages for OpenRouter API
    let formattedMessages = [];
    
    // Add system prompt specifically for DeepSeek free model to help improve response quality
    if (model.includes('deepseek') && model.includes(':free')) {
      const systemPrompt = options.systemPrompt || 
        "You are DeepSeek, a helpful AI assistant. Provide clear, concise, and accurate information. " +
        "Always answer the question directly and stay focused on the topic. " + 
        "Avoid generating repetitive text like 'Hello' multiple times. " +
        "If you are uncertain about something, acknowledge it rather than making up information. " +
        "Response should be coherent and meaningful to the user's query.";
      
      // Add system prompt if not already present
      const hasSystemPrompt = messages.some(msg => msg.role === 'system');
      if (!hasSystemPrompt) {
        formattedMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }
    }
    
    // Add the user's messages
    formattedMessages = [
      ...formattedMessages,
      ...messages.map(message => ({
        role: message.role,
        content: message.content,
      }))
    ];
    
    // Build request payload according to DeepSeek and OpenRouter documentation
    const payload: any = {
      model: model,
      messages: formattedMessages,
      temperature: options.temperature ?? (model.includes('deepseek') ? 0.5 : 0.7), // Lower temperature for DeepSeek to reduce randomness
      max_tokens: options.maxTokens ?? (model.includes('deepseek') ? 1000 : 2048),  // Limit token length for DeepSeek
      presence_penalty: options.presencePenalty ?? (model.includes('deepseek') ? 0.2 : 0), // Increase presence penalty for DeepSeek
      frequency_penalty: options.frequencyPenalty ?? (model.includes('deepseek') ? 0.5 : 0), // Increase frequency penalty for DeepSeek
      top_p: model.includes('deepseek') ? 0.8 : 0.95, // Lower top_p for DeepSeek to make outputs more focused
      stream: false,   // We don't want streaming
      response_format: { type: "text" } // Explicitly request text format, not JSON
    };
    
    // Log the model being used
    console.log(`Using OpenRouter with model: ${model}`);
    
    // Create headers with either the provided API key or the default one
    const headers = {
      ...DEFAULT_HEADERS
    };
    
    // If a custom API key is provided, use it instead
    if (options.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey}`;
    }
    
    // Log the full payload for debugging
    console.log('OpenRouter request payload:', {
      model: payload.model,
      messageCount: payload.messages.length,
      temperature: payload.temperature,
      max_tokens: payload.max_tokens,
      response_format: payload.response_format
    });
    
    // Send request to OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_API_URL}/chat/completions`, 
      payload,
      { headers }
    );
    
    // Log the full response structure for debugging
    console.log('OpenRouter API raw response structure:', {
      status: response.status,
      headers: response.headers['content-type'],
      dataType: typeof response.data,
      hasChoices: response.data.choices ? true : false,
      choicesCount: response.data.choices ? response.data.choices.length : 0,
      model: response.data.model
    });
    
    if (response.data.choices && response.data.choices.length > 0) {
      const firstChoice = response.data.choices[0];
      console.log('First choice details:', {
        finish_reason: firstChoice.finish_reason,
        message: firstChoice.message ? {
          role: firstChoice.message.role,
          contentType: typeof firstChoice.message.content,
          contentPreview: typeof firstChoice.message.content === 'string' ? 
            (firstChoice.message.content.substring(0, 30) + '...') : 'non-string content'
        } : 'undefined'
      });
    }
    
    // Log successful response
    console.log(`OpenRouter API response successful with model: ${model}`);
    
    return response.data;
  } catch (error: any) {
    console.error('Error in OpenRouter API call:', error);
    
    // Log detailed error information for debugging
    if (error.response) {
      console.error('OpenRouter API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    let errorMessage = 'Failed to connect to OpenRouter API.';
    
    // Handle specific error cases
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.response?.status === 404) {
      errorMessage = 'Model not found. Please select a different model in settings.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid API key. Please check your OpenRouter API key.';
    }
    
    throw new Error(errorMessage);
  }
}