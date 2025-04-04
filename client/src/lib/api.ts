import { MessageType } from "@/lib/types";

// Function to verify if OpenRouter's free tier is accessible
export async function verifyOpenRouterConnection(): Promise<boolean> {
  try {
    const response = await fetch("/api/verify-openrouter");
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.connected;
  } catch (error) {
    console.error("OpenRouter connection error:", error);
    return false;
  }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("/api/validate-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiKey }),
    });
    
    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error("API key validation error:", error);
    return false;
  }
}

export async function validateOpenRouterApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("/api/validate-openrouter-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiKey }),
    });
    
    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error("OpenRouter API key validation error:", error);
    return false;
  }
}

export async function sendChatRequest(
  apiKey: string,
  model: string,
  messages: MessageType[],
  provider: "openai" | "deepseek" | "openrouter" = "openai",
  modelParameters?: {
    temperature?: number;
    maxTokens?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    systemPrompt?: string;
  }
) {
  try {
    // Log which provider and model we're using
    console.log(`Sending request to ${provider} using model: ${model}`);
    
    // If we have a system prompt and it's not already in the messages, add it
    let processedMessages = [...messages];
    if (modelParameters?.systemPrompt) {
      // Check if there's already a system message at the beginning
      const hasSystemMessage = messages.length > 0 && messages[0].role === 'system';
      
      // If not, prepend a system message
      if (!hasSystemMessage) {
        processedMessages = [
          { role: 'system', content: modelParameters.systemPrompt },
          ...messages
        ];
      }
    }
    
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey,
        model,
        provider,
        messages: processedMessages.map(({ role, content }) => ({ role, content })),
        temperature: modelParameters?.temperature,
        max_tokens: modelParameters?.maxTokens,
        presence_penalty: modelParameters?.presencePenalty,
        frequency_penalty: modelParameters?.frequencyPenalty,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      let providerName = "the AI service";
      if (provider === "openai") providerName = "OpenAI";
      else if (provider === "deepseek") providerName = "DeepSeek";
      else if (provider === "openrouter") providerName = "OpenRouter (Free AI)";
      
      throw new Error(errorData.message || `Failed to get response from ${providerName}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getConversations() {
  try {
    const response = await fetch("/api/conversations");
    
    if (!response.ok) {
      throw new Error("Failed to fetch conversations");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

export async function getConversation(id: number) {
  try {
    const response = await fetch(`/api/conversations/${id}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch conversation");
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching conversation ${id}:`, error);
    throw error;
  }
}

export async function createConversation(title: string, model: string) {
  try {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, model }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create conversation");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

export async function addMessageToConversation(conversationId: number, message: MessageType) {
  try {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) {
      throw new Error("Failed to add message to conversation");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}

export async function deleteConversation(id: number) {
  try {
    const response = await fetch(`/api/conversations/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete conversation");
    }
  } catch (error) {
    console.error(`Error deleting conversation ${id}:`, error);
    throw error;
  }
}

export async function clearAllConversations() {
  try {
    const response = await fetch("/api/conversations", {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to clear conversations");
    }
  } catch (error) {
    console.error("Error clearing conversations:", error);
    throw error;
  }
}
