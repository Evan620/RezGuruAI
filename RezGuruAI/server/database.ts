import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { 
  users, 
  leads, 
  workflows, 
  documents, 
  scrapingJobs 
} from '../shared/schema';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle client
export const db = drizzle(pool);

// Initialize database
export async function initDb() {
  try {
    console.log('Initializing database...');
    
    // Verify connection by querying users table
    const result = await db.select().from(users).limit(1);
    console.log('Database connection verified');
    
    return true;
  } catch (error: any) {
    if (error.message.includes('relation "users" does not exist')) {
      console.log('Tables not found. Creating schema...');
      try {
        await createSchema();
        console.log('Schema created successfully');
        return true;
      } catch (err) {
        console.error('Error creating schema:', err);
        return false;
      }
    } else {
      console.error('Database initialization error:', error);
      return false;
    }
  }
}

// Create database schema
async function createSchema() {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        password VARCHAR(200) NOT NULL,
        full_name VARCHAR(200),
        plan VARCHAR(50) NOT NULL DEFAULT 'free',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create leads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        address VARCHAR(200),
        city VARCHAR(100),
        state VARCHAR(50),
        zip VARCHAR(20),
        phone VARCHAR(20),
        email VARCHAR(150),
        source VARCHAR(100) NOT NULL,
        motivation_score INTEGER,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        amount_owed VARCHAR(50),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create workflows table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        trigger VARCHAR(100) NOT NULL,
        actions JSONB NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        last_run TIMESTAMP WITH TIME ZONE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        type VARCHAR(100) NOT NULL,
        content TEXT,
        url VARCHAR(500),
        status VARCHAR(50) NOT NULL,
        lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create scraping_jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scraping_jobs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        source VARCHAR(100) NOT NULL,
        url VARCHAR(500),
        status VARCHAR(50) NOT NULL,
        results JSONB,
        last_run TIMESTAMP WITH TIME ZONE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add a sample user
    await client.query(`
      INSERT INTO users (username, password, full_name, plan)
      VALUES ('demo', 'demo123', 'Alex Morgan', 'free')
    `);
    
    // Add some sample leads
    await client.query(`
      INSERT INTO leads (name, address, city, state, zip, phone, email, source, motivation_score, status, notes, user_id)
      VALUES 
        ('John Smith', '123 Main St', 'Austin', 'TX', '78701', '512-555-1234', 'john.smith@example.com', 'Tax Records', 8, 'New', 'Property has been vacant for 6 months', 1),
        ('Sarah Johnson', '456 Elm St', 'Austin', 'TX', '78704', '512-555-5678', 'sarah.j@example.com', 'Direct Mail', 7, 'Contacted', 'Interested in selling in next 3-6 months', 1),
        ('Robert Williams', '789 Oak Rd', 'Austin', 'TX', '78745', '512-555-9012', 'rwilliams@example.com', 'Website', 5, 'Nurturing', 'Has rental property with problem tenants', 1),
        ('Maria Garcia', '101 Pine Ave', 'San Antonio', 'TX', '78201', '210-555-3456', 'mgarcia@example.com', 'Facebook Ad', 9, 'Qualified', 'Motivated seller - behind on payments', 1),
        ('James Wilson', '202 Cedar Blvd', 'Dallas', 'TX', '75201', '214-555-7890', 'jwilson@example.com', 'Referral', 6, 'Appointment', 'Scheduled viewing for Tuesday 3pm', 1)
    `);
    
    // Add some sample workflows
    await client.query(`
      INSERT INTO workflows (name, description, trigger, actions, active, user_id)
      VALUES 
        ('Tax Delinquent Follow-up', 'Automated follow-up sequence for tax delinquent leads', 'new_lead', '[{"type":"email","config":{"template":"tax_delinquent","delay":0}},{"type":"sms","config":{"template":"introduction","delay":86400}},{"type":"email","config":{"template":"offer","delay":259200}}]', true, 1),
        ('Web Lead Nurture', 'Nurture sequence for website leads', 'new_lead', '[{"type":"email","config":{"template":"welcome","delay":0}},{"type":"task","config":{"task":"Phone call","assignee":"user","delay":172800}}]', true, 1)
    `);
    
    // Add some sample documents
    await client.query(`
      INSERT INTO documents (name, type, status, lead_id, user_id)
      VALUES 
        ('Purchase Offer - 123 Main St', 'Contract', 'Draft', 1, 1),
        ('Comps Analysis - 456 Elm St', 'Analysis', 'Completed', 2, 1),
        ('Property Inspection - 789 Oak Rd', 'Report', 'Pending', 3, 1)
    `);
    
    // Add some sample scraping jobs
    await client.query(`
      INSERT INTO scraping_jobs (name, source, status, user_id)
      VALUES 
        ('Travis County Tax Records', 'county_records', 'Ready', 1),
        ('Foreclosure Listings', 'foreclosure_com', 'Configured', 1)
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Release client
    client.release();
  }
}