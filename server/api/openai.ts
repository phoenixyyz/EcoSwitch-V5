import OpenAI from "openai";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";

// We need to use the OpenAI API types directly to ensure compatibility
export async function createChatCompletion(
  apiKey: string,
  model: string,
  messages: Array<{
    role: string;
    content: any; // Using any to handle all possible content formats
  }>,
  options?: {
    temperature?: number;
    max_tokens?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
  }
) {
  try {
    // Make sure to use a valid API key
    const openai = new OpenAI({ apiKey });
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    // If the user selects gpt-4, map it to gpt-4o for best results
    const finalModel = model === "gpt-4" ? "gpt-4o" : model;
    
    // Format messages for OpenAI API
    const formattedMessages = messages.map(msg => {
      // Map the role to the expected format
      const role = msg.role === "user" ? "user" :
                  msg.role === "assistant" ? "assistant" :
                  msg.role === "system" ? "system" : "user";
      
      // Process the content based on its type
      if (typeof msg.content === 'string') {
        // Simple string content
        return { role, content: msg.content };
      } 
      else if (Array.isArray(msg.content)) {
        // Array of content parts - convert to OpenAI's format
        const contentParts = msg.content.map(part => {
          if (typeof part === 'string') {
            return { type: 'text', text: part } as ChatCompletionContentPart;
          } else if (part.type === 'text' && part.text) {
            return { type: 'text', text: part.text } as ChatCompletionContentPart;
          } else if (part.type === 'image_url' && part.image_url?.url) {
            return { 
              type: 'image_url', 
              image_url: { url: part.image_url.url } 
            } as ChatCompletionContentPart;
          }
          return null;
        }).filter(Boolean);
        
        return { role, content: contentParts };
      }
      else if (typeof msg.content === 'object') {
        // Single object - convert to array format
        if (msg.content.type === 'text' && msg.content.text) {
          return { role, content: [{ type: 'text', text: msg.content.text }] };
        } else if (msg.content.type === 'image_url' && msg.content.image_url?.url) {
          return { 
            role, 
            content: [{ 
              type: 'image_url', 
              image_url: { url: msg.content.image_url.url } 
            }] 
          };
        }
      }
      
      // Fallback - treat as text
      return { role, content: String(msg.content) };
    });
    
    // We need to cast to any because the OpenAI types don't align perfectly
    // with our dynamic message content handling
    const response = await openai.chat.completions.create({
      model: finalModel,
      messages: formattedMessages as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens,
      presence_penalty: options?.presence_penalty,
      frequency_penalty: options?.frequency_penalty,
    });
    
    return {
      success: true,
      data: response
    };
  } catch (error: any) {
    console.error(`OpenAI API Error: ${error.message}`);
    
    // Enhanced error messages for common issues
    let errorMessage = `OpenAI Error: ${error.message}`;
    
    // Check for specific error types
    if (error.message.includes("insufficient_quota")) {
      errorMessage = "OpenAI Error: Insufficient account balance. Please add funds to your OpenAI account.";
    } else if (error.message.includes("model_not_found")) {
      errorMessage = `OpenAI Error: The model "${model}" was not found or is not available with your account.`;
    } else if (error.message.includes("invalid_api_key")) {
      errorMessage = "OpenAI Error: Invalid API key provided.";
    } else if (error.message.includes("rate_limit")) {
      errorMessage = "OpenAI Error: Rate limit exceeded. Please try again later.";
    }
    
    return {
      success: false,
      error: {
        message: errorMessage,
        status: error.status || 500
      }
    };
  }
}

export async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    if (!apiKey || !apiKey.startsWith('sk-') || apiKey.length < 51) {
      return false;
    }
    
    // Test the API key with a minimal request
    const openai = new OpenAI({ apiKey });
    const response = await openai.models.list();
    return response.data.length > 0;
  } catch (error) {
    console.error('OpenAI API key verification error:', error);
    return false;
  }
}

export function validateApiKey(apiKey: string): boolean {
  // Basic validation - OpenAI API keys start with 'sk-' and are 51 characters long
  return apiKey.startsWith('sk-') && apiKey.length >= 51;
}
