import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendChatRequest, verifyOpenRouterConnection } from "@/lib/api";
import { MessageType, MessageContent, ConversationType, SettingsType } from "@/lib/types";

interface ChatContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isKeyValid: boolean;
  validateApiKey: () => Promise<boolean>;
  
  deepseekApiKey: string;
  setDeepseekApiKey: (key: string) => void;
  isDeepseekKeyValid: boolean;
  validateDeepseekApiKey: () => Promise<boolean>;
  
  openRouterApiKey: string;
  setOpenRouterApiKey: (key: string) => void;
  isOpenRouterKeyValid: boolean;
  validateOpenRouterApiKey: () => Promise<boolean>;
  
  isOpenRouterAvailable: boolean;
  checkOpenRouterConnection: () => Promise<boolean>;
  
  currentPrompt: string;
  setCurrentPrompt: (prompt: string) => void;
  
  imageAttachment: string | null;
  setImageAttachment: (image: string | null) => void;
  
  settings: SettingsType;
  updateSettings: (newSettings: Partial<SettingsType>) => void;
  
  conversations: ConversationType[];
  currentConversation: ConversationType | null;
  messages: MessageType[];
  
  isLoading: boolean;
  sendPrompt: () => Promise<void>;
  
  clearPrompt: () => void;
  selectConversation: (id: number) => void;
  createNewConversation: () => void;
  clearHistory: () => Promise<void>;
}

const defaultSettings: SettingsType = {
  darkMode: false,
  autoSave: true,
  model: "gpt-3.5-turbo",
  apiProvider: "openai", // Will be dynamically updated based on available APIs
  modelParameters: {
    temperature: 0.7,
    maxTokens: 1000,
    presencePenalty: 0,
    frequencyPenalty: 0,
    systemPrompt: "Respond to the user's questions concisely and helpfully."
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  // OpenAI API Key state
  const [apiKey, setApiKey] = useState<string>("");
  const [isKeyValid, setIsKeyValid] = useState<boolean>(false);
  
  // DeepSeek API Key state
  const [deepseekApiKey, setDeepseekApiKey] = useState<string>("");
  const [isDeepseekKeyValid, setIsDeepseekKeyValid] = useState<boolean>(false);
  
  // OpenRouter state (free AI option)
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>("");
  const [isOpenRouterKeyValid, setIsOpenRouterKeyValid] = useState<boolean>(false);
  const [isOpenRouterAvailable, setIsOpenRouterAvailable] = useState<boolean>(false);
  
  // Input state
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  
  // Conversation state
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load API keys and settings from local storage on mount
  useEffect(() => {
    // Load OpenAI API key
    const storedApiKey = localStorage.getItem("chatgpt-api-key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
      validateApiKey(storedApiKey);
    }
    
    // Load DeepSeek API key
    const storedDeepseekApiKey = localStorage.getItem("deepseek-api-key");
    if (storedDeepseekApiKey) {
      setDeepseekApiKey(storedDeepseekApiKey);
      validateDeepseekApiKey(storedDeepseekApiKey);
    }
    
    const storedSettings = localStorage.getItem("chatgpt-settings");
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({...defaultSettings, ...parsedSettings});
        
        // Apply dark mode if enabled
        if (parsedSettings.darkMode) {
          document.documentElement.classList.add("dark");
        }
      } catch (e) {
        console.error("Failed to parse settings from localStorage");
      }
    }
    
    // Check if OpenRouter is available (free AI option)
    checkOpenRouterConnection();
    
    // Fetch conversations from API
    fetchConversations();
  }, []);
  
  // Fetch conversations from the API
  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };
  
  // Validate OpenAI API key
  const validateApiKey = async (key: string = apiKey): Promise<boolean> => {
    try {
      // If key is empty, immediately set isKeyValid to false and return
      if (!key || key.trim() === '') {
        setIsKeyValid(false);
        localStorage.removeItem("chatgpt-api-key");
        return false;
      }
      
      const response = await fetch("/api/validate-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: key }),
      });
      
      const data = await response.json();
      setIsKeyValid(data.valid);
      
      // Save valid API key to localStorage
      if (data.valid && settings.autoSave) {
        localStorage.setItem("chatgpt-api-key", key);
        
        // Set OpenAI as the active provider when validating this key
        if (data.valid) {
          updateSettings({ apiProvider: "openai" });
        }
      }
      
      return data.valid;
    } catch (error) {
      console.error("OpenAI API key validation error:", error);
      setIsKeyValid(false);
      return false;
    }
  };
  
  // Validate DeepSeek API key
  const validateDeepseekApiKey = async (key: string = deepseekApiKey): Promise<boolean> => {
    try {
      // If key is empty, immediately set isDeepseekKeyValid to false and return
      if (!key || key.trim() === '') {
        setIsDeepseekKeyValid(false);
        localStorage.removeItem("deepseek-api-key");
        return false;
      }
      
      const response = await fetch("/api/validate-deepseek-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: key }),
      });
      
      const data = await response.json();
      setIsDeepseekKeyValid(data.valid);
      
      // Save valid API key to localStorage
      if (data.valid && settings.autoSave) {
        localStorage.setItem("deepseek-api-key", key);
        
        // Set DeepSeek as the active provider when validating this key
        if (data.valid) {
          updateSettings({ apiProvider: "deepseek" });
        }
      }
      
      return data.valid;
    } catch (error) {
      console.error("DeepSeek API key validation error:", error);
      setIsDeepseekKeyValid(false);
      return false;
    }
  };
  
  // Validate OpenRouter API key
  const validateOpenRouterApiKey = async (key: string = openRouterApiKey): Promise<boolean> => {
    try {
      // If key is empty, immediately set isOpenRouterKeyValid to false and return
      if (!key || key.trim() === '') {
        setIsOpenRouterKeyValid(false);
        localStorage.removeItem("openrouter-api-key");
        return false;
      }
      
      const response = await fetch("/api/validate-openrouter-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: key }),
      });
      
      const data = await response.json();
      setIsOpenRouterKeyValid(data.valid);
      
      // Save valid API key to localStorage if autoSave is enabled
      if (data.valid && settings.autoSave) {
        localStorage.setItem("openrouter-api-key", key);
      }
      
      // Set OpenRouter as the active provider when key is valid
      if (data.valid) {
        // Always use the specific DeepSeek v3 model when switching to OpenRouter
        updateSettings({ 
          apiProvider: "openrouter",
          model: "deepseek/deepseek-v3-base:free" // Default to DeepSeek v3 for OpenRouter
        });
      }
      
      return data.valid;
    } catch (error) {
      console.error("OpenRouter API key validation error:", error);
      setIsOpenRouterKeyValid(false);
      return false;
    }
  };
  
  // Check OpenRouter connection
  const checkOpenRouterConnection = async (): Promise<boolean> => {
    try {
      // Try to verify connection to OpenRouter server
      const response = await fetch("/api/verify-openrouter");
      const data = await response.json();
      
      // Only check if the server responded with connected:true
      if (data.connected) {
        setIsOpenRouterAvailable(true);
        
        // Always set the model to DeepSeek v3 when using OpenRouter
        if (settings.apiProvider === "openrouter") {
          updateSettings({
            model: "deepseek/deepseek-v3-base:free"
          });
        }
        
        return true;
      } else {
        setIsOpenRouterAvailable(false);
        return false;
      }
    } catch (error) {
      console.error("OpenRouter connection check error:", error);
      setIsOpenRouterAvailable(false);
      return false;
    }
  };
  
  // Update settings
  const updateSettings = (newSettings: Partial<SettingsType>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save settings to localStorage
    localStorage.setItem("chatgpt-settings", JSON.stringify(updatedSettings));
    
    // Apply dark mode changes
    if (newSettings.darkMode !== undefined) {
      if (newSettings.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    
    // If autoSave is disabled, remove API key from localStorage
    if (newSettings.autoSave === false) {
      localStorage.removeItem("chatgpt-api-key");
    } else if (newSettings.autoSave === true && isKeyValid) {
      localStorage.setItem("chatgpt-api-key", apiKey);
    }
  };
  
  // Send prompt to API
  const sendPrompt = async () => {
    // Check if any valid API credentials are available
    const hasValidOpenAI = apiKey && isKeyValid;
    const hasValidDeepSeek = deepseekApiKey && isDeepseekKeyValid;
    const hasValidOpenRouter = openRouterApiKey && isOpenRouterKeyValid;
    const hasServerOpenRouter = isOpenRouterAvailable;
    
    // We need either a valid key for the selected provider or a fallback option
    const hasValidCredentials = hasValidOpenAI || hasValidDeepSeek || hasValidOpenRouter || hasServerOpenRouter;
    
    if (!hasValidCredentials || (!currentPrompt.trim() && !imageAttachment)) {
      toast({
        title: "Error",
        description: !hasValidCredentials
          ? "No API keys are available. Please enter a valid API key for any provider." 
          : "Please enter a prompt or attach an image",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new conversation if none exists
    if (!currentConversation) {
      await createNewConversation();
    }
    
    let messageContent: MessageContent | MessageContent[];
    
    // If we have both image and text
    if (imageAttachment && currentPrompt.trim()) {
      messageContent = [
        {
          type: "text",
          text: currentPrompt
        },
        {
          type: "image_url",
          image_url: {
            url: imageAttachment
          }
        }
      ];
    } 
    // If we only have an image
    else if (imageAttachment) {
      messageContent = {
        type: "image_url",
        image_url: {
          url: imageAttachment
        }
      };
    } 
    // If we only have text
    else {
      messageContent = currentPrompt;
    }
    
    const userMessage: MessageType = {
      role: "user",
      content: messageContent,
    };
    
    // Optimistically update UI with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Clear the prompt input and image attachment
    setCurrentPrompt("");
    setImageAttachment(null);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Save user message to the conversation
      if (currentConversation?.id) {
        const msgResponse = await fetch(`/api/conversations/${currentConversation.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userMessage),
        });
        
        if (!msgResponse.ok) {
          throw new Error("Failed to save user message");
        }
      }
      
      // Get all messages for context
      const chatMessages = updatedMessages.map(({ role, content }) => ({ role, content }));
      
      // Determine which provider to use based on the model selected or settings
      let modelToUse = settings.model;
      let providerToUse: "openai" | "deepseek" | "openrouter" = settings.apiProvider;
      
      // Check if the model is from OpenAI or DeepSeek
      const openAIModels = ["gpt-3.5-turbo", "gpt-4o", "gpt-4-turbo"];
      const deepSeekModels = ["deepseek-chat", "deepseek-coder", "deepseek-llm-67b-chat"];
      // OpenRouter models with their proper model IDs
      const openRouterModels = [
        'deepseek/deepseek-v3-base:free' // We're simplifying to just the Assistant model
      ];

      // Model detection based on format
      // If the model has a "/" in it, it's an OpenRouter model
      if (modelToUse.includes('/')) {
        providerToUse = "openrouter";
      }
      // Otherwise check against our known lists
      else if (openAIModels.includes(modelToUse)) {
        providerToUse = "openai";
      }
      else if (deepSeekModels.includes(modelToUse)) {
        providerToUse = "deepseek";
      }
      
      // Handle OpenRouter (alternative API option)
      if (providerToUse === "openrouter") {
        // Check if user has OpenRouter API key or if the server has one available
        if (!isOpenRouterKeyValid && !isOpenRouterAvailable) {
          throw new Error("OpenRouter Error: No valid OpenRouter API key available. Please provide a valid OpenRouter API key or try another API provider.");
        }
        
        // Always use DeepSeek v3 as the model for OpenRouter
        modelToUse = "deepseek/deepseek-v3-base:free";
      }
      // Handle OpenAI models
      else if (providerToUse === "openai") {
        // Check if OpenAI API key is valid
        if (!apiKey || !isKeyValid) {
          // If OpenRouter is available or has a valid key, use it as fallback
          if (isOpenRouterAvailable || isOpenRouterKeyValid) {
            providerToUse = "openrouter";
            modelToUse = "deepseek/deepseek-v3-base:free";
          } else {
            throw new Error("OpenAI Error: Valid OpenAI API key required for this model. Please enter a valid OpenAI API key or use OpenRouter AI instead.");
          }
        }
      } 
      // Handle DeepSeek models
      else if (providerToUse === "deepseek") {
        // Check if DeepSeek API key is valid
        if (!deepseekApiKey || !isDeepseekKeyValid) {
          // If OpenRouter is available or has a valid key, use it as fallback
          if (isOpenRouterAvailable || isOpenRouterKeyValid) {
            providerToUse = "openrouter";
            modelToUse = "deepseek/deepseek-v3-base:free";
          } else {
            throw new Error("DeepSeek Error: Valid DeepSeek API key required for this model. Please enter a valid DeepSeek API key or use OpenRouter AI instead.");
          }
        }
      }
      
      // Force OpenAI for image analysis - other providers don't support images
      if (imageAttachment) {
        if (apiKey && isKeyValid) {
          modelToUse = "gpt-4o";
          providerToUse = "openai";
        } else {
          throw new Error("Image Error: Valid OpenAI API key required for image analysis since other providers don't support this feature.");
        }
      }
      
      // Send to selected API provider
      let apiKeyToUse = "";
      if (providerToUse === "openai") {
        apiKeyToUse = apiKey;
      } else if (providerToUse === "deepseek") {
        apiKeyToUse = deepseekApiKey;
      } else if (providerToUse === "openrouter") {
        apiKeyToUse = openRouterApiKey;
      }
      
      const data = await sendChatRequest(
        apiKeyToUse, 
        modelToUse,
        chatMessages,
        providerToUse,
        {
          temperature: settings.modelParameters.temperature,
          maxTokens: settings.modelParameters.maxTokens,
          presencePenalty: settings.modelParameters.presencePenalty,
          frequencyPenalty: settings.modelParameters.frequencyPenalty,
          systemPrompt: settings.modelParameters.systemPrompt
        }
      );
      
      // Extract the assistant's response
      const assistantMessage: MessageType = {
        role: "assistant",
        content: data.choices[0].message.content,
        provider: providerToUse  // Use the actual provider that was used for the request
      };
      
      // Update messages with assistant's response
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Save assistant message to the conversation
      if (currentConversation?.id) {
        await fetch(`/api/conversations/${currentConversation.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assistantMessage),
        });
      }
      
      // Update conversations list
      fetchConversations();
      
    } catch (error) {
      console.error("Error sending prompt:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get a response from ChatGPT",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear current prompt
  const clearPrompt = () => {
    setCurrentPrompt("");
  };
  
  // Select a conversation
  const selectConversation = async (id: number) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }
      
      const conversation = await response.json();
      setCurrentConversation(conversation);
      setMessages(conversation.messages || []);
    } catch (error) {
      console.error("Error selecting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };
  
  // Create a new conversation
  const createNewConversation = async () => {
    try {
      // Use the first few words of the first message as the title
      const title = currentPrompt.trim() 
        ? currentPrompt.split(" ").slice(0, 5).join(" ") + "..."
        : "New conversation";
      
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          model: settings.model,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }
      
      const newConversation = await response.json();
      setCurrentConversation(newConversation);
      setMessages([]);
      
      // Update conversations list
      await fetchConversations();
      
      return newConversation;
    } catch (error) {
      console.error("Error creating new conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create a new conversation",
        variant: "destructive",
      });
    }
  };
  
  // Clear conversation history
  const clearHistory = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to clear history");
      }
      
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      
      toast({
        title: "Success",
        description: "Conversation history cleared",
      });
    } catch (error) {
      console.error("Error clearing history:", error);
      toast({
        title: "Error",
        description: "Failed to clear conversation history",
        variant: "destructive",
      });
    }
  };
  
  const contextValue: ChatContextType = {
    apiKey,
    setApiKey,
    isKeyValid,
    validateApiKey,
    
    deepseekApiKey,
    setDeepseekApiKey,
    isDeepseekKeyValid,
    validateDeepseekApiKey,
    
    openRouterApiKey,
    setOpenRouterApiKey,
    isOpenRouterKeyValid,
    validateOpenRouterApiKey,
    
    isOpenRouterAvailable,
    checkOpenRouterConnection,
    
    currentPrompt,
    setCurrentPrompt,
    imageAttachment,
    setImageAttachment,
    settings,
    updateSettings,
    conversations,
    currentConversation,
    messages,
    isLoading,
    sendPrompt,
    clearPrompt,
    selectConversation,
    createNewConversation,
    clearHistory,
  };
  
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
