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

// Models available through OpenRouter - we're only using Assistant model to simplify options
export const openRouterModels = [
  'deepseek/deepseek-v3-base:free',      // Assistant (Default, Free)
];

// Function to determine if we have a valid free tier connection
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
    
    const headers = {
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ecoswitch.replit.app',
      'X-Title': 'EcoSwitch AI',
      'Authorization': `Bearer ${apiKey}`,
      'OpenRouter-Data-Policy': 'allow'
    };
    
    const response = await axios.get(`${OPENROUTER_API_URL}/models`, {
      headers: headers,
    });
    
    return response.status === 200;
  } catch (error: any) {
    console.error('Error validating OpenRouter API key:', error);
    return false;
  }
}

// Function to create a chat completion with OpenRouter
export async function createOpenRouterChatCompletion(
  model: string = 'deepseek/deepseek-v3-base:free',
  messages: MessageType[],
  options: {
    temperature?: number;
    maxTokens?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    systemPrompt?: string;
    apiKey?: string; // Add custom API key parameter
  } = {}
) {
  try {
    // Format messages for OpenRouter
    const formattedMessages = messages.map(message => ({
      role: message.role,
      content: message.content,
    }));
    
    // Add system message if provided
    if (options.systemPrompt) {
      formattedMessages.unshift({
        role: 'system',
        content: options.systemPrompt,
      });
    }
    
    // Build request payload with additional settings to prevent inconsistent behavior
    const payload = {
      model: model,
      messages: formattedMessages,
      temperature: options.temperature ?? 0.5, // Lower temperature for more deterministic outputs
      max_tokens: options.maxTokens ?? 800,    // Reduced max tokens to avoid long responses
      presence_penalty: options.presencePenalty ?? 0.1, // Small presence penalty to discourage repetition
      frequency_penalty: options.frequencyPenalty ?? 0.2, // Increased frequency penalty to reduce repetition
      top_p: 0.9,     // Slightly reduced top_p 
      top_k: 40,      // Add top_k parameter to limit token selection
      seed: 42,       // Keep the seed value to ensure consistent output
      stop: ["\n\n\n"], // Add stop sequences to prevent excessive newlines
      stream: false,  // Explicitly set streaming to false
      response_format: { type: "text" } // Explicitly request text format
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
    
    // Send request to OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_API_URL}/chat/completions`, 
      payload,
      { headers }
    );
    
    // Log successful response
    console.log(`OpenRouter API response successful with model: ${model}`);
    
    
    return response.data;
  } catch (error: any) {
    console.error('Error in OpenRouter API call:', error);
    // Log the full error for debugging
    console.error('OpenRouter API error details:', JSON.stringify(error.response?.data || error.message || error));
    
    let errorMessage = 'Failed to connect to OpenRouter API.';
    
    // Handle specific error cases
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.response?.status === 404) {
      errorMessage = 'Model not found. Please select a different model in settings.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    }
    
    throw new Error(errorMessage);
  }
}