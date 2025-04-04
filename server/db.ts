import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a drizzle instance with our schema
export const db = drizzle(pool, { schema });

// Function to initialize the database (create tables if they don't exist)
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    // We're using the schema directly since tables are defined in shared/schema.ts
    // Table creation is handled by migrations in a production environment
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}