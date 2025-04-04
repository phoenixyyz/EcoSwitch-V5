import { db } from './db';

export async function runMigrations() {
  try {
    console.log('Running migrations...');
    // This would typically use sql migrations from a directory
    // Since we're using a simple schema-based approach, we'll create tables directly
    
    // Create tables directly from our schema
    await db.execute(
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        password_hash VARCHAR(255)
      )`
    );
    
    await db.execute(
      `CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    );
    
    await db.execute(
      `CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        model VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    );
    
    await db.execute(
      `CREATE TABLE IF NOT EXISTS conversation_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
        UNIQUE(conversation_id, message_id)
      )`
    );
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}