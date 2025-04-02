import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  enhancedInsertLeadSchema, enhancedInsertWorkflowSchema, 
  enhancedInsertDocumentSchema, enhancedInsertScrapingJobSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Authentication
  apiRouter.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    res.json({ 
      id: user.id, 
      username: user.username,
      fullName: user.fullName,
      plan: user.plan
    });
  });
  
  // User routes
  apiRouter.get("/users/me", async (req, res) => {
    // For demo purposes, we'll use user 1
    const userId = 1;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      plan: user.plan
    });
  });
  
  // Lead routes
  apiRouter.get("/leads", async (req, res) => {
    const userId = 1; // Demo user
    const status = req.query.status as string | undefined;
    
    const leads = status 
      ? await storage.getLeadsByStatus(userId, status)
      : await storage.getLeads(userId);
    
    res.json(leads);
  });
  
  apiRouter.get("/leads/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const lead = await storage.getLead(id);
    
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    
    res.json(lead);
  });
  
  apiRouter.post("/leads", async (req, res) => {
    try {
      const data = enhancedInsertLeadSchema.parse({ ...req.body, userId: 1 });
      const lead = await storage.createLead(data);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid lead data", 
          errors: error.errors 
        });
      }
      throw error;
    }
  });
  
  apiRouter.patch("/leads/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
      const lead = await storage.updateLead(id, req.body);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid lead data", 
          errors: error.errors 
        });
      }
      throw error;
    }
  });
  
  apiRouter.delete("/leads/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteLead(id);
    
    if (!success) {
      return res.status(404).json({ message: "Lead not found" });
    }
    
    res.status(204).end();
  });
  
  // Workflow routes
  apiRouter.get("/workflows", async (req, res) => {
    const userId = 1; // Demo user
    const workflows = await storage.getWorkflows(userId);
    res.json(workflows);
  });
  
  apiRouter.get("/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const workflow = await storage.getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    
    res.json(workflow);
  });
  
  apiRouter.post("/workflows", async (req, res) => {
    try {
      const data = enhancedInsertWorkflowSchema.parse({ ...req.body, userId: 1 });
      const workflow = await storage.createWorkflow(data);
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid workflow data", 
          errors: error.errors 
        });
      }
      throw error;
    }
  });
  
  apiRouter.patch("/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
      const workflow = await storage.updateWorkflow(id, req.body);
      
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      res.json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid workflow data", 
          errors: error.errors 
        });
      }
      throw error;
    }
  });
  
  apiRouter.delete("/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteWorkflow(id);
    
    if (!success) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    
    res.status(204).end();
  });
  
  // Document routes
  apiRouter.get("/documents", async (req, res) => {
    const userId = 1; // Demo user
    const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
    
    const documents = leadId
      ? await storage.getDocumentsByLead(leadId)
      : await storage.getDocuments(userId);
    
    res.json(documents);
  });
  
  apiRouter.get("/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const document = await storage.getDocument(id);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    res.json(document);
  });
  
  apiRouter.post("/documents", async (req, res) => {
    try {
      const data = enhancedInsertDocumentSchema.parse({ ...req.body, userId: 1 });
      const document = await storage.createDocument(data);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid document data", 
          errors: error.errors 
        });
      }
      throw error;
    }
  });
  
  apiRouter.patch("/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
      const document = await storage.updateDocument(id, req.body);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid document data", 
          errors: error.errors 
        });
      }
      throw error;
    }
  });
  
  apiRouter.delete("/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteDocument(id);
    
    if (!success) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    res.status(204).end();
  });
  
  // Scraping job routes
  apiRouter.get("/scraping-jobs", async (req, res) => {
    const userId = 1; // Demo user
    const jobs = await storage.getScrapingJobs(userId);
    res.json(jobs);
  });
  
  apiRouter.get("/scraping-jobs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const job = await storage.getScrapingJob(id);
    
    if (!job) {
      return res.status(404).json({ message: "Scraping job not found" });
    }
    
    res.json(job);
  });
  
  apiRouter.post("/scraping-jobs", async (req, res) => {
    try {
      const data = enhancedInsertScrapingJobSchema.parse({ ...req.body, userId: 1 });
      const job = await storage.createScrapingJob(data);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid scraping job data", 
          errors: error.errors 
        });
      }
      throw error;
    }
  });
  
  apiRouter.patch("/scraping-jobs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
      const job = await storage.updateScrapingJob(id, req.body);
      
      if (!job) {
        return res.status(404).json({ message: "Scraping job not found" });
      }
      
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid scraping job data", 
          errors: error.errors 
        });
      }
      throw error;
    }
  });
  
  apiRouter.delete("/scraping-jobs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteScrapingJob(id);
    
    if (!success) {
      return res.status(404).json({ message: "Scraping job not found" });
    }
    
    res.status(204).end();
  });
  
  // AI lead scoring endpoint
  apiRouter.post("/ai/score-lead", async (req, res) => {
    const { leadData } = req.body;
    
    if (!leadData) {
      return res.status(400).json({ message: "Lead data is required" });
    }
    
    // In a real implementation, this would call an AI model
    // For demo purposes, we'll return a random score
    const score = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
    
    res.json({ score });
  });
  
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
