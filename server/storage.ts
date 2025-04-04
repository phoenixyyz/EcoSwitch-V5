import { 
  users, type User, type InsertUser,
  messages, type Message, type InsertMessage,
  conversations, type Conversation, type InsertConversation,
  conversationMessages, type ConversationMessage, type InsertConversationMessage
} from "@shared/schema";
import { PgStorage } from './pgStorage';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  listConversations(): Promise<Conversation[]>;
  
  // Get messages for a conversation
  getConversationMessages(conversationId: number): Promise<Message[]>;
  
  // Add message to conversation
  addMessageToConversation(conversationId: number, messageId: number): Promise<ConversationMessage>;
  
  // Delete conversation
  deleteConversation(id: number): Promise<void>;
  
  // Clear all conversations
  clearAllConversations(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private conversations: Map<number, Conversation>;
  private convMessages: Map<number, ConversationMessage>;
  
  private userId: number;
  private messageId: number;
  private conversationId: number;
  private convMessageId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.conversations = new Map();
    this.convMessages = new Map();
    
    this.userId = 1;
    this.messageId = 1;
    this.conversationId = 1;
    this.convMessageId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const timestamp = new Date();
    const message: Message = { ...insertMessage, id, timestamp };
    this.messages.set(id, message);
    return message;
  }
  
  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationId++;
    const timestamp = new Date();
    const conversation: Conversation = { ...insertConversation, id, timestamp };
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  async listConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // Conversation-message relationship methods
  async getConversationMessages(conversationId: number): Promise<Message[]> {
    const messageIds = Array.from(this.convMessages.values())
      .filter(cm => cm.conversationId === conversationId)
      .map(cm => cm.messageId);
    
    return messageIds
      .map(id => this.messages.get(id))
      .filter((m): m is Message => !!m)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async addMessageToConversation(conversationId: number, messageId: number): Promise<ConversationMessage> {
    const id = this.convMessageId++;
    const convMessage: ConversationMessage = { 
      id, 
      conversationId, 
      messageId 
    };
    
    this.convMessages.set(id, convMessage);
    return convMessage;
  }
  
  async deleteConversation(id: number): Promise<void> {
    // Delete the conversation
    this.conversations.delete(id);
    
    // Find all conversation-message relations with this conversationId
    const relationIds = Array.from(this.convMessages.entries())
      .filter(([_, cm]) => cm.conversationId === id)
      .map(([id, _]) => id);
    
    // Delete all those relations
    for (const id of relationIds) {
      this.convMessages.delete(id);
    }
  }
  
  async clearAllConversations(): Promise<void> {
    this.conversations.clear();
    this.convMessages.clear();
  }
}

// Using in-memory storage for simplicity
export const storage = new MemStorage();
