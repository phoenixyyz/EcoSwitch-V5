import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createChatCompletion, validateApiKey } from "./api/openai";
import { validateDeepSeekApiKey, verifyDeepSeekApiKey, createDeepSeekChatCompletion } from "./api/deepseek";
import { verifyOpenRouterConnection, createOpenRouterChatCompletion, verifyOpenRouterApiKey } from "./api/openrouter";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const API_PREFIX = "/api";
  
  // Validate OpenAI API key route
  app.post(`${API_PREFIX}/validate-key`, async (req: Request, res: Response) => {
    try {
      const apiKeySchema = z.object({
        apiKey: z.string()
      });
      
      const { apiKey } = apiKeySchema.parse(req.body);
      const isValid = validateApiKey(apiKey);
      
      res.json({ valid: isValid });
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid request", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Validate DeepSeek API key route
  app.post(`${API_PREFIX}/validate-deepseek-key`, async (req: Request, res: Response) => {
    try {
      const apiKeySchema = z.object({
        apiKey: z.string()
      });
      
      const { apiKey } = apiKeySchema.parse(req.body);
      
      // Check if the key is empty
      if (!apiKey || apiKey.trim() === '') {
        return res.json({ valid: false });
      }
      
      const isValid = validateDeepSeekApiKey(apiKey);
      console.log("DeepSeek basic validation result:", isValid, "for key:", apiKey);
      
      // If it passes basic validation, verify with the API
      if (isValid) {
        try {
          const isApiValid = await verifyDeepSeekApiKey(apiKey);
          console.log("DeepSeek API key validation result:", isApiValid);
          return res.json({ valid: isApiValid });
        } catch (error) {
          console.error("Error verifying DeepSeek API key:", error);
          return res.json({ valid: false });
        }
      } else {
        return res.json({ valid: false });
      }
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid request", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Validate OpenRouter API key
  app.post(`${API_PREFIX}/validate-openrouter-key`, async (req: Request, res: Response) => {
    try {
      const apiKeySchema = z.object({
        apiKey: z.string()
      });
      
      const { apiKey } = apiKeySchema.parse(req.body);
      
      // Check if the key is empty
      if (!apiKey || apiKey.trim() === '') {
        return res.json({ valid: false });
      }
      
      try {
        const isValid = await verifyOpenRouterApiKey(apiKey);
        return res.json({ valid: isValid });
      } catch (error) {
        console.error("Error verifying OpenRouter API key:", error);
        return res.json({ valid: false });
      }
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid request", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Verify OpenRouter connection route (for free tier)
  app.get(`${API_PREFIX}/verify-openrouter`, async (_req: Request, res: Response) => {
    try {
      const isConnected = await verifyOpenRouterConnection();
      res.json({ connected: isConnected });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to connect to OpenRouter", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Chat completion route
  app.post(`${API_PREFIX}/chat`, async (req: Request, res: Response) => {
    try {
      // More flexible content schema to support multimodal messages
      const contentSchema = z.union([
        z.string(), 
        z.object({
          type: z.enum(["text", "image_url"]),
          text: z.string().optional(),
          image_url: z.object({
            url: z.string()
          }).optional()
        }),
        z.array(z.union([
          z.string(),
          z.object({
            type: z.enum(["text", "image_url"]),
            text: z.string().optional(),
            image_url: z.object({
              url: z.string()
            }).optional()
          })
        ]))
      ]);
      
      const chatSchema = z.object({
        apiKey: z.string(),
        model: z.string(),
        provider: z.enum(["openai", "deepseek", "openrouter"]),
        messages: z.array(z.object({
          role: z.string(),
          content: contentSchema
        })),
        temperature: z.number().min(0).max(2).optional(),
        max_tokens: z.number().min(1).max(4096).optional(),
        presence_penalty: z.number().min(-2).max(2).optional(),
        frequency_penalty: z.number().min(-2).max(2).optional()
      });
      
      const { apiKey, model, provider, messages, temperature, max_tokens, presence_penalty, frequency_penalty } = chatSchema.parse(req.body);
      
      // Validate API key based on provider
      if (provider === "openai") {
        if (!validateApiKey(apiKey)) {
          return res.status(400).json({ message: "OpenAI Error: Invalid API key format. OpenAI keys should start with 'sk-' and be at least 51 characters long." });
        }
        
        const response = await createChatCompletion(apiKey, model, messages, {
          temperature,
          max_tokens,
          presence_penalty,
          frequency_penalty
        });
        
        if (!response.success) {
          return res.status(response.error?.status || 500).json({ 
            message: response.error?.message || "An error occurred with the OpenAI API" 
          });
        }
        
        res.json(response.data);
      } 
      else if (provider === "deepseek") {
        if (!validateDeepSeekApiKey(apiKey)) {
          return res.status(400).json({ message: "DeepSeek Error: Invalid API key format. DeepSeek keys should start with 'sk-' and be at least 32 characters long." });
        }
        
        const response = await createDeepSeekChatCompletion(messages, model, apiKey, {
          temperature,
          max_tokens,
          presence_penalty,
          frequency_penalty
        });
        
        if (!response.success) {
          return res.status(response.error?.status || 500).json({ 
            message: response.error?.message || "An error occurred with the DeepSeek API" 
          });
        }
        
        res.json(response.data);
      }
      else if (provider === "openrouter") {
        try {
          // Check if user has a valid API key
          let isValid = false;
          let useEnvironmentKey = false;
          
          // First try with provided key
          if (apiKey && apiKey.trim() !== '') {
            console.log("Attempting to use provided OpenRouter API key");
            isValid = await verifyOpenRouterApiKey(apiKey);
            
            if (!isValid) {
              return res.status(401).json({ 
                message: "OpenRouter Error: The provided API key is invalid. Please check your OpenRouter API key." 
              });
            }
          } else {
            // If no key provided, try using environment key
            console.log("No OpenRouter API key provided, using environment key if available");
            const isConnected = await verifyOpenRouterConnection();
            
            if (!isConnected) {
              return res.status(401).json({ 
                message: "OpenRouter Error: No valid API key available. Please provide an OpenRouter API key." 
              });
            }
            
            useEnvironmentKey = true;
          }
          
          // Force DeepSeek v3 as the only model for OpenRouter, regardless of what was sent
          const modelToUse = 'deepseek/deepseek-v3-base:free';
          
          // Log the model being used for OpenRouter
          console.log(`Using OpenRouter with model: ${modelToUse} (requested: ${model})`);
          
          // Cast messages to have the correct role type
          const typedMessages = messages.map(msg => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content
          }));
          
          // Pass the API key to the OpenRouter function if valid
          const response = await createOpenRouterChatCompletion(modelToUse, typedMessages, {
            temperature: temperature || 0.7,
            maxTokens: max_tokens || 1000,
            presencePenalty: presence_penalty || 0,
            frequencyPenalty: frequency_penalty || 0,
            apiKey: apiKey && apiKey.trim() !== '' ? apiKey : undefined
          });
          
          // Get the response content from OpenRouter
          let responseContent = '';
          
          if (response.choices && response.choices.length > 0 && response.choices[0].message) {
            // Extract the raw content from the response
            const rawContent = response.choices[0].message.content;
            
            if (typeof rawContent === 'string') {
              // Only remove repeating patterns, preserve all character sets
              responseContent = rawContent
                .replace(/(.{30,}?)\1{3,}/g, '$1') // Only remove very long repeating patterns that repeat 3+ times
                .trim();
              
              // Log the content processing
              console.log(`Original content length: ${rawContent.length}, processed length: ${responseContent.length}`);
              
              // If we ended up with empty content after processing, use the original
              if (!responseContent && rawContent) {
                console.log("Warning: Content processing resulted in empty string, using original content");
                responseContent = rawContent.trim();
              }
            } else {
              console.log("Warning: OpenRouter response content is not a string", typeof rawContent);
              responseContent = JSON.stringify(rawContent);
            }
          }
          
          // Create a standardized response
          res.json({
            id: response.id || 'openrouter-response',
            object: response.object || 'chat.completion',
            created: response.created || Math.floor(Date.now() / 1000),
            model: response.model || modelToUse, // Use the forced model here too
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: responseContent
                },
                index: 0,
                finish_reason: response.choices[0].finish_reason || 'stop'
              }
            ]
          });
        } catch (error) {
          console.error("OpenRouter Error:", error);
          return res.status(500).json({ 
            message: `OpenRouter Error: ${error instanceof Error ? error.message : "Failed to get response from OpenRouter."}`
          });
        }
      }
      else {
        return res.status(400).json({ message: "Invalid API provider" });
      }
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid request", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Conversations routes
  app.post(`${API_PREFIX}/conversations`, async (req: Request, res: Response) => {
    try {
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(data);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid request", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.get(`${API_PREFIX}/conversations`, async (_req: Request, res: Response) => {
    try {
      const conversations = await storage.listConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ 
        message: "Server error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.get(`${API_PREFIX}/conversations/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const messages = await storage.getConversationMessages(id);
      
      res.json({
        ...conversation,
        messages
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Server error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.delete(`${API_PREFIX}/conversations/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      await storage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ 
        message: "Server error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.delete(`${API_PREFIX}/conversations`, async (_req: Request, res: Response) => {
    try {
      await storage.clearAllConversations();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ 
        message: "Server error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Messages routes
  app.post(`${API_PREFIX}/conversations/:id/messages`, async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      await storage.addMessageToConversation(conversationId, message.id);
      
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid request", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
