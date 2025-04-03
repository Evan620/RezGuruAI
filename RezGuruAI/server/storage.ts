import { 
  users, leads, workflows, documents, scrapingJobs,
  type User, type InsertUser, 
  type Lead, type InsertLead, 
  type Workflow, type InsertWorkflow, 
  type Document, type InsertDocument, 
  type ScrapingJob, type InsertScrapingJob 
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead operations
  getLead(id: number): Promise<Lead | undefined>;
  getLeads(userId: number): Promise<Lead[]>;
  getLeadsByStatus(userId: number, status: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<Lead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  
  // Workflow operations
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflows(userId: number): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<Workflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocuments(userId: number): Promise<Document[]>;
  getDocumentsByLead(leadId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Scraping operations
  getScrapingJob(id: number): Promise<ScrapingJob | undefined>;
  getScrapingJobs(userId: number): Promise<ScrapingJob[]>;
  createScrapingJob(job: InsertScrapingJob): Promise<ScrapingJob>;
  updateScrapingJob(id: number, job: Partial<ScrapingJob>): Promise<ScrapingJob | undefined>;
  deleteScrapingJob(id: number): Promise<boolean>;
  
  // Analytics operations
  getLeadSourcesAnalytics(userId: number, timeframe?: string): Promise<any[]>;
  getLeadActivityAnalytics(userId: number, timeframe?: string): Promise<any[]>;
  getPropertyTypesAnalytics(userId: number, timeframe?: string): Promise<any[]>;
  getRevenueAnalytics(userId: number, timeframe?: string): Promise<any[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private workflows: Map<number, Workflow>;
  private documents: Map<number, Document>;
  private scrapingJobs: Map<number, ScrapingJob>;
  
  private userIdCounter: number;
  private leadIdCounter: number;
  private workflowIdCounter: number;
  private documentIdCounter: number;
  private scrapingJobIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.workflows = new Map();
    this.documents = new Map();
    this.scrapingJobs = new Map();
    
    this.userIdCounter = 1;
    this.leadIdCounter = 1;
    this.workflowIdCounter = 1;
    this.documentIdCounter = 1;
    this.scrapingJobIdCounter = 1;
    
    // Add sample user
    const now = new Date();
    this.users.set(1, {
      id: 1,
      username: "demo@rezguru.ai",
      password: "password123",
      fullName: "Alex Morgan",
      plan: "free",
      createdAt: now,
      updatedAt: now
    });
    
    // Add sample data
    this.seedData();
  }
  
  // Seed with some sample data for development
  private seedData() {
    // Sample leads
    const sampleLeads: InsertLead[] = [
      { 
        name: "John Smith", 
        address: "123 Main St", 
        city: "Phoenix", 
        state: "AZ", 
        zip: "85001", 
        source: "tax_delinquent", 
        motivationScore: 85, 
        status: "new", 
        amountOwed: "$4,200",
        userId: 1
      },
      { 
        name: "Maria Garcia", 
        address: "456 Elm St", 
        city: "Mesa", 
        state: "AZ", 
        zip: "85201", 
        source: "probate", 
        motivationScore: 92, 
        status: "new", 
        userId: 1
      },
      { 
        name: "Robert Johnson", 
        address: "789 Oak Dr", 
        city: "Scottsdale", 
        state: "AZ", 
        zip: "85251", 
        source: "fsbo", 
        motivationScore: 62, 
        status: "new", 
        userId: 1
      },
      { 
        name: "Sarah Williams", 
        address: "321 Pine Rd", 
        city: "Tempe", 
        state: "AZ", 
        zip: "85281", 
        source: "tax_delinquent", 
        motivationScore: 78, 
        status: "new", 
        userId: 1
      },
      { 
        name: "David Brown", 
        address: "567 Maple Ave", 
        city: "Gilbert", 
        state: "AZ", 
        zip: "85296", 
        source: "probate", 
        motivationScore: 88, 
        status: "contacted", 
        userId: 1
      },
      { 
        name: "Jennifer Miller", 
        address: "890 Cedar St", 
        city: "Chandler", 
        state: "AZ", 
        zip: "85224", 
        source: "tax_delinquent", 
        motivationScore: 94, 
        status: "contacted", 
        userId: 1
      },
      { 
        name: "Michael Davis", 
        address: "432 Birch Ln", 
        city: "Glendale", 
        state: "AZ", 
        zip: "85301", 
        source: "fsbo", 
        motivationScore: 65, 
        status: "contacted", 
        userId: 1
      },
      { 
        name: "Emily Wilson", 
        address: "765 Spruce Ct", 
        city: "Phoenix", 
        state: "AZ", 
        zip: "85001", 
        source: "tax_delinquent", 
        motivationScore: 95, 
        status: "closed", 
        userId: 1
      },
      { 
        name: "Daniel Taylor", 
        address: "234 Willow Dr", 
        city: "Mesa", 
        state: "AZ", 
        zip: "85201", 
        source: "probate", 
        motivationScore: 90, 
        status: "closed", 
        userId: 1
      }
    ];
    
    sampleLeads.forEach(lead => this.createLead(lead));
    
    // Sample workflows
    const sampleWorkflows: InsertWorkflow[] = [
      {
        name: "Tax Delinquent Follow-up",
        description: "Automatically sends SMS and follows up with a call to tax delinquent leads.",
        trigger: "new_lead",
        actions: [
          { type: "filter", config: { source: "tax_delinquent" } },
          { type: "sms", config: { template: "Hi {{name}}, we noticed your property at {{address}} has tax issues. We can help." } },
          { type: "delay", config: { hours: 24 } },
          { type: "call", config: { script: "Hello, this is RezGuru calling about your property..." } }
        ],
        active: true,
        userId: 1
      },
      {
        name: "Probate Lead Processor",
        description: "Scrapes probate records, scores leads, and sends personalized emails.",
        trigger: "scheduled",
        actions: [
          { type: "scrape", config: { source: "probate", url: "https://countycourts.org/probate" } },
          { type: "score", config: { model: "ai-lead-scorer" } },
          { type: "email", config: { template: "Dear {{name}}, we understand this is a difficult time..." } }
        ],
        active: true,
        userId: 1
      },
      {
        name: "FSBO Document Generator",
        description: "Creates purchase offers and contracts for FSBO leads that respond.",
        trigger: "lead_update",
        actions: [
          { type: "filter", config: { source: "fsbo", status: "contacted" } },
          { type: "calculate", config: { offer: "0.7 * market_value" } },
          { type: "document", config: { template: "offer_letter", variables: ["name", "address", "offer_amount"] } }
        ],
        active: true,
        userId: 1
      }
    ];
    
    sampleWorkflows.forEach(workflow => this.createWorkflow(workflow));
    
    // Sample documents
    const sampleDocuments: InsertDocument[] = [
      {
        name: "Purchase Offer - 123 Main St",
        type: "contract",
        status: "signed",
        leadId: 1,
        userId: 1
      },
      {
        name: "FCRA Dispute Letter",
        type: "dispute_letter",
        status: "draft",
        leadId: 2,
        userId: 1
      },
      {
        name: "Cash Offer - 456 Elm St",
        type: "offer",
        status: "rejected",
        leadId: 3,
        userId: 1
      },
      {
        name: "Assignment Contract",
        type: "contract",
        status: "sent",
        leadId: 4,
        userId: 1
      }
    ];
    
    sampleDocuments.forEach(document => this.createDocument(document));
    
    // Sample scraping jobs
    const sampleJobs: InsertScrapingJob[] = [
      {
        name: "Maricopa County Tax Delinquent",
        source: "tax_delinquent",
        url: "https://treasurer.maricopa.gov/delinquent-taxes",
        status: "completed",
        userId: 1
      },
      {
        name: "Pima County Probate Records",
        source: "probate",
        url: "https://www.sc.pima.gov/probate",
        status: "pending",
        userId: 1
      },
      {
        name: "Phoenix FSBO Listings",
        source: "fsbo",
        url: "https://phoenix.craigslist.org/search/reo",
        status: "failed",
        userId: 1
      }
    ];
    
    sampleJobs.forEach(job => this.createScrapingJob(job));
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
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName || null,
      plan: insertUser.plan || null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }
  
  async getLeads(userId: number): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(
      (lead) => lead.userId === userId,
    );
  }
  
  async getLeadsByStatus(userId: number, status: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(
      (lead) => lead.userId === userId && lead.status === status,
    );
  }
  
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.leadIdCounter++;
    const now = new Date();
    const lead: Lead = { 
      id,
      name: insertLead.name,
      address: insertLead.address || null,
      city: insertLead.city || null,
      state: insertLead.state || null,
      zip: insertLead.zip || null,
      phone: insertLead.phone || null,
      email: insertLead.email || null,
      source: insertLead.source,
      motivationScore: insertLead.motivationScore || null,
      status: insertLead.status || null,
      notes: insertLead.notes || null,
      amountOwed: insertLead.amountOwed || null,
      userId: insertLead.userId,
      createdAt: now,
      updatedAt: now
    };
    this.leads.set(id, lead);
    return lead;
  }
  
  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead = { 
      ...lead, 
      ...updates,
      updatedAt: new Date()
    };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }
  
  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }
  
  // Workflow methods
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }
  
  async getWorkflows(userId: number): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(
      (workflow) => workflow.userId === userId,
    );
  }
  
  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowIdCounter++;
    const workflow: Workflow = { 
      id,
      name: insertWorkflow.name,
      description: insertWorkflow.description || null,
      trigger: insertWorkflow.trigger,
      actions: insertWorkflow.actions,
      active: insertWorkflow.active || null,
      userId: insertWorkflow.userId || null,
      lastRun: null,
      createdAt: new Date()
    };
    this.workflows.set(id, workflow);
    return workflow;
  }
  
  async updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    
    const updatedWorkflow = { ...workflow, ...updates };
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }
  
  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }
  
  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId,
    );
  }
  
  async getDocumentsByLead(leadId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.leadId === leadId,
    );
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const document: Document = { 
      id,
      name: insertDocument.name,
      type: insertDocument.type,
      content: insertDocument.content || null,
      url: insertDocument.url || null,
      status: insertDocument.status || null,
      leadId: insertDocument.leadId || null,
      userId: insertDocument.userId || null,
      createdAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...updates };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  // Scraping methods
  async getScrapingJob(id: number): Promise<ScrapingJob | undefined> {
    return this.scrapingJobs.get(id);
  }
  
  async getScrapingJobs(userId: number): Promise<ScrapingJob[]> {
    return Array.from(this.scrapingJobs.values()).filter(
      (job) => job.userId === userId,
    );
  }
  
  async createScrapingJob(insertJob: InsertScrapingJob): Promise<ScrapingJob> {
    const id = this.scrapingJobIdCounter++;
    const job: ScrapingJob = { 
      id,
      name: insertJob.name,
      source: insertJob.source,
      url: insertJob.url || null,
      status: insertJob.status || null,
      userId: insertJob.userId || null,
      notes: insertJob.notes || null,
      schedule: insertJob.schedule || null,
      results: [],
      lastRun: null,
      createdAt: new Date()
    };
    this.scrapingJobs.set(id, job);
    return job;
  }
  
  async updateScrapingJob(id: number, updates: Partial<ScrapingJob>): Promise<ScrapingJob | undefined> {
    const job = this.scrapingJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.scrapingJobs.set(id, updatedJob);
    return updatedJob;
  }
  
  async deleteScrapingJob(id: number): Promise<boolean> {
    return this.scrapingJobs.delete(id);
  }
  
  // Analytics operations
  async getLeadSourcesAnalytics(userId: number, timeframe: string = 'year'): Promise<any[]> {
    // Return sample data for in-memory storage
    return [
      { name: "Tax Delinquent", value: 42, color: "#6E56CF" },
      { name: "Probate", value: 28, color: "#FF6B6B" },
      { name: "FSBO", value: 19, color: "#00F5D4" },
      { name: "MLS", value: 11, color: "#FFD166" }
    ];
  }
  
  async getLeadActivityAnalytics(userId: number, timeframe: string = 'year'): Promise<any[]> {
    // Return sample data for in-memory storage
    return [
      { month: "Jan", leads: 12, contacts: 10, deals: 4 },
      { month: "Feb", leads: 18, contacts: 12, deals: 5 },
      { month: "Mar", leads: 22, contacts: 15, deals: 7 },
      { month: "Apr", leads: 28, contacts: 18, deals: 9 },
      { month: "May", leads: 35, contacts: 22, deals: 11 },
      { month: "Jun", leads: 42, contacts: 28, deals: 12 }
    ];
  }
  
  async getPropertyTypesAnalytics(userId: number, timeframe: string = 'year'): Promise<any[]> {
    // Return sample data for in-memory storage
    return [
      { name: "Single Family", value: 45, color: "#6E56CF" },
      { name: "Multi-Family", value: 25, color: "#FF6B6B" },
      { name: "Commercial", value: 15, color: "#00F5D4" },
      { name: "Land", value: 15, color: "#FFD166" }
    ];
  }
  
  async getRevenueAnalytics(userId: number, timeframe: string = 'year'): Promise<any[]> {
    // Return sample data for in-memory storage
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

// Import the PostgreSQL storage implementation
import { PgStorage } from './pg-storage';

// Use PostgreSQL storage instead of in-memory storage
export const storage = new PgStorage();
