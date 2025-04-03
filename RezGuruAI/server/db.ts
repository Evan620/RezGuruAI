import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@shared/schema';
import ws from 'ws';

// Configure WebSocket for Neon database
if (!globalThis.WebSocket) {
  // @ts-ignore
  globalThis.WebSocket = ws;
}

// Create a PostgreSQL connection pool using the DATABASE_URL environment variable
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

// Create a Drizzle client with the schema
export const db = drizzle(pool, { schema });