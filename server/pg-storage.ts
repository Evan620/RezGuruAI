import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { IStorage } from './storage';
import { 
  User, InsertUser,
  Lead, InsertLead,
  Workflow, InsertWorkflow,
  Document, InsertDocument,
  ScrapingJob, InsertScrapingJob,
  users, leads, workflows, documents, scrapingJobs
} from '../shared/schema';

export class PgStorage implements IStorage {
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  // Lead operations
  async getLead(id: number): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    return result[0];
  }
  
  async getLeads(userId: number): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.userId, userId));
  }
  
  async getLeadsByStatus(userId: number, status: string): Promise<Lead[]> {
    return await db.select().from(leads).where(
      and(
        eq(leads.userId, userId),
        eq(leads.status, status)
      )
    );
  }
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(lead).returning();
    return result[0];
  }
  
  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined> {
    // Remove id from updates if it exists
    const { id: _, ...updateValues } = updates;
    
    const result = await db.update(leads)
      .set(updateValues)
      .where(eq(leads.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteLead(id: number): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id)).returning({ id: leads.id });
    return result.length > 0;
  }
  
  // Workflow operations
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const result = await db.select().from(workflows).where(eq(workflows.id, id));
    return result[0];
  }
  
  async getWorkflows(userId: number): Promise<Workflow[]> {
    return await db.select().from(workflows).where(eq(workflows.userId, userId));
  }
  
  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const result = await db.insert(workflows).values(workflow).returning();
    return result[0];
  }
  
  async updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined> {
    // Remove id from updates if it exists
    const { id: _, ...updateValues } = updates;
    
    const result = await db.update(workflows)
      .set(updateValues)
      .where(eq(workflows.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteWorkflow(id: number): Promise<boolean> {
    const result = await db.delete(workflows).where(eq(workflows.id, id)).returning({ id: workflows.id });
    return result.length > 0;
  }
  
  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.id, id));
    return result[0];
  }
  
  async getDocuments(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }
  
  async getDocumentsByLead(leadId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.leadId, leadId));
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const result = await db.insert(documents).values(document).returning();
    return result[0];
  }
  
  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    // Remove id from updates if it exists
    const { id: _, ...updateValues } = updates;
    
    const result = await db.update(documents)
      .set(updateValues)
      .where(eq(documents.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning({ id: documents.id });
    return result.length > 0;
  }
  
  // ScrapingJob operations
  async getScrapingJob(id: number): Promise<ScrapingJob | undefined> {
    const result = await db.select().from(scrapingJobs).where(eq(scrapingJobs.id, id));
    return result[0];
  }
  
  async getScrapingJobs(userId: number): Promise<ScrapingJob[]> {
    return await db.select().from(scrapingJobs).where(eq(scrapingJobs.userId, userId));
  }
  
  async createScrapingJob(job: InsertScrapingJob): Promise<ScrapingJob> {
    const result = await db.insert(scrapingJobs).values(job).returning();
    return result[0];
  }
  
  async updateScrapingJob(id: number, updates: Partial<ScrapingJob>): Promise<ScrapingJob | undefined> {
    // Remove id from updates if it exists
    const { id: _, ...updateValues } = updates;
    
    const result = await db.update(scrapingJobs)
      .set(updateValues)
      .where(eq(scrapingJobs.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteScrapingJob(id: number): Promise<boolean> {
    const result = await db.delete(scrapingJobs).where(eq(scrapingJobs.id, id)).returning({ id: scrapingJobs.id });
    return result.length > 0;
  }
}