import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { IStorage } from './storage';
import { 
  User, InsertUser,
  Lead, InsertLead,
  Workflow, InsertWorkflow,
  Document, InsertDocument,
  ScrapingJob, InsertScrapingJob,
  users, leads, workflows, documents, scrapingJobs,
  analyticsLeadSources, analyticsLeadActivity, analyticsPropertyTypes, analyticsRevenue
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

  // Analytics operations
  async getLeadSourcesAnalytics(userId: number, timeframe: string = 'year'): Promise<any[]> {
    try {
      const result = await db.select().from(analyticsLeadSources).where(eq(analyticsLeadSources.userId, userId));
      return result;
    } catch (error) {
      console.error("Error fetching lead sources analytics:", error);
      // Return sample data for demo purposes
      return [
        { name: "Tax Delinquent", value: 42, color: "#6E56CF" },
        { name: "Probate", value: 28, color: "#FF6B6B" },
        { name: "FSBO", value: 19, color: "#00F5D4" },
        { name: "MLS", value: 11, color: "#FFD166" }
      ];
    }
  }
  
  async getLeadActivityAnalytics(userId: number, timeframe: string = 'year'): Promise<any[]> {
    try {
      const result = await db.select().from(analyticsLeadActivity).where(eq(analyticsLeadActivity.userId, userId));
      return result;
    } catch (error) {
      console.error("Error fetching lead activity analytics:", error);
      // Return sample data for demo purposes
      return [
        { month: "Jan", leads: 12, contacts: 10, deals: 4 },
        { month: "Feb", leads: 18, contacts: 12, deals: 5 },
        { month: "Mar", leads: 22, contacts: 15, deals: 7 },
        { month: "Apr", leads: 28, contacts: 18, deals: 9 },
        { month: "May", leads: 35, contacts: 22, deals: 11 },
        { month: "Jun", leads: 42, contacts: 28, deals: 12 }
      ];
    }
  }
  
  async getPropertyTypesAnalytics(userId: number, timeframe: string = 'year'): Promise<any[]> {
    try {
      const result = await db.select().from(analyticsPropertyTypes).where(eq(analyticsPropertyTypes.userId, userId));
      return result;
    } catch (error) {
      console.error("Error fetching property types analytics:", error);
      // Return sample data for demo purposes
      return [
        { name: "Single Family", value: 45, color: "#6E56CF" },
        { name: "Multi-Family", value: 25, color: "#FF6B6B" },
        { name: "Commercial", value: 15, color: "#00F5D4" },
        { name: "Land", value: 15, color: "#FFD166" }
      ];
    }
  }
  
  async getRevenueAnalytics(userId: number, timeframe: string = 'year'): Promise<any[]> {
    try {
      const result = await db.select().from(analyticsRevenue).where(eq(analyticsRevenue.userId, userId));
      return result;
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      // Return sample data for demo purposes
      return [
        { month: "Jan", revenue: 12000, profit: 4800, cost: 7200 },
        { month: "Feb", revenue: 15000, profit: 6000, cost: 9000 },
        { month: "Mar", revenue: 18000, profit: 7200, cost: 10800 },
        { month: "Apr", revenue: 22000, profit: 8800, cost: 13200 },
        { month: "May", revenue: 25000, profit: 10000, cost: 15000 },
        { month: "Jun", revenue: 30000, profit: 12000, cost: 18000 }
      ];
    }
  }
}