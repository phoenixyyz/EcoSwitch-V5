import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { IStorage } from './storage';
import { 
  users, messages, conversations, conversationMessages,
  User, Message, Conversation, ConversationMessage,
  InsertUser, InsertMessage, InsertConversation, InsertConversationMessage
} from '../shared/schema';

export class PgStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return result[0];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async listConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(conversations.timestamp);
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    const result = await db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        timestamp: messages.timestamp
      })
      .from(conversationMessages)
      .innerJoin(messages, eq(conversationMessages.messageId, messages.id))
      .where(eq(conversationMessages.conversationId, conversationId))
      .orderBy(messages.timestamp);
    
    return result;
  }

  async addMessageToConversation(conversationId: number, messageId: number): Promise<ConversationMessage> {
    const values: InsertConversationMessage = {
      conversationId,
      messageId
    };
    
    const result = await db.insert(conversationMessages).values(values).returning();
    return result[0];
  }

  async deleteConversation(id: number): Promise<void> {
    // Find all message IDs associated with this conversation
    const messageLinks = await db
      .select({ messageId: conversationMessages.messageId })
      .from(conversationMessages)
      .where(eq(conversationMessages.conversationId, id));
    
    const messageIds = messageLinks.map(link => link.messageId);
    
    // Delete conversation_messages entries first (foreign key constraint)
    await db
      .delete(conversationMessages)
      .where(eq(conversationMessages.conversationId, id));
    
    // Delete messages associated with this conversation
    if (messageIds.length > 0) {
      for (const messageId of messageIds) {
        await db.delete(messages).where(eq(messages.id, messageId));
      }
    }
    
    // Delete the conversation itself
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async clearAllConversations(): Promise<void> {
    // Delete all conversation_messages entries first (foreign key constraint)
    await db.delete(conversationMessages);
    
    // Delete all messages
    await db.delete(messages);
    
    // Delete all conversations
    await db.delete(conversations);
  }
}