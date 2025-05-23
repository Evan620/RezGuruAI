import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  enhancedInsertLeadSchema, enhancedInsertWorkflowSchema, 
  enhancedInsertDocumentSchema, enhancedInsertScrapingJobSchema,
  Lead
} from "@shared/schema";
import { z } from "zod";
import { scoreLeadWithAI, updateLeadMotivationScore } from "./services/leadScoringService";
import { generateDocument, getDocumentTemplates, getDocumentTemplate, DocumentGenerationParams } from "./services/documentGenerationService";
import { runScrapingJob, createLeadFromScrapingResult, scheduleScrapingJob } from "./services/scrapingService";
import { processUserMessage, AIMessage } from "./services/aiService";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  const apiRouter = express.Router();
  
  // User routes
  apiRouter.get("/users/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return the current authenticated user
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });
  
  // Lead routes
  apiRouter.get("/leads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const data = enhancedInsertLeadSchema.parse({ ...req.body, userId: req.user.id });
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
  
  // Score a lead using AI
  apiRouter.patch("/leads/:id/score", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Score the lead using AI
      const scoringResult = await scoreLeadWithAI(lead);
      
      // Update the lead with the new motivation score
      const updatedLead = await updateLeadMotivationScore(lead, scoringResult);
      
      // Save the updated lead to storage
      const savedLead = await storage.updateLead(id, {
        motivationScore: updatedLead.motivationScore,
        notes: updatedLead.notes
      });
      
      // Return the scoring result and updated lead
      res.json({
        lead: savedLead,
        scoring: scoringResult
      });
    } catch (error) {
      console.error("Error scoring lead:", error);
      res.status(500).json({ 
        message: "Error scoring lead", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Workflow routes
  apiRouter.get("/workflows", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const data = enhancedInsertWorkflowSchema.parse({ ...req.body, userId: req.user.id });
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const data = enhancedInsertDocumentSchema.parse({ ...req.body, userId: req.user.id });
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const data = enhancedInsertScrapingJobSchema.parse({ ...req.body, userId: req.user.id });
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
  
  // Run a scraping job
  apiRouter.post("/scraping-jobs/:id/run", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getScrapingJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Scraping job not found" });
      }
      
      const results = await runScrapingJob(jobId);
      res.json({ success: true, results });
    } catch (error) {
      console.error("Error running scraping job:", error);
      res.status(500).json({ 
        message: "Error running scraping job", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Schedule a scraping job
  apiRouter.post("/scraping-jobs/:id/schedule", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getScrapingJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Scraping job not found" });
      }
      
      const updatedJob = await scheduleScrapingJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      console.error("Error scheduling scraping job:", error);
      res.status(500).json({ 
        message: "Error scheduling scraping job", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create a lead from a scraping result
  apiRouter.post("/scraping-jobs/:jobId/results/:resultId/create-lead", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const jobId = parseInt(req.params.jobId);
      const resultId = req.params.resultId;
      const userId = req.user.id;
      
      const job = await storage.getScrapingJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Scraping job not found" });
      }
      
      const lead = await createLeadFromScrapingResult(resultId, jobId, userId);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating lead from scraping result:", error);
      res.status(500).json({ 
        message: "Error creating lead from scraping result", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // AI lead scoring endpoint
  apiRouter.post("/ai/score-lead", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { leadId } = req.body;
      
      if (!leadId) {
        return res.status(400).json({ message: "Lead ID is required" });
      }
      
      // Get the lead from storage
      const lead = await storage.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Verify that the lead belongs to the authenticated user
      if (lead.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to score this lead" });
      }
      
      // Score the lead using AI
      const scoringResult = await scoreLeadWithAI(lead);
      
      // Update the lead with the new motivation score
      const updatedLead = await updateLeadMotivationScore(lead, scoringResult);
      
      // Save the updated lead to storage
      const savedLead = await storage.updateLead(lead.id, {
        motivationScore: updatedLead.motivationScore,
        notes: updatedLead.notes
      });
      
      // Return the scoring result and updated lead
      res.json({
        lead: savedLead,
        scoring: scoringResult
      });
    } catch (error) {
      console.error("Error scoring lead:", error);
      res.status(500).json({ 
        message: "Error scoring lead",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // New endpoint to get AI analysis for a specific lead
  apiRouter.get("/ai/lead-analysis/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Verify that the lead belongs to the authenticated user
      if (lead.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to analyze this lead" });
      }
      
      const scoringResult = await scoreLeadWithAI(lead);
      
      res.json({
        lead: {
          id: lead.id,
          name: lead.name,
          source: lead.source,
          status: lead.status,
          motivationScore: lead.motivationScore
        },
        analysis: scoringResult
      });
    } catch (error) {
      console.error("Error analyzing lead:", error);
      res.status(500).json({ 
        message: "Error analyzing lead", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Document template routes
  apiRouter.get("/document-templates", (req, res) => {
    try {
      const templates = getDocumentTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error getting document templates:", error);
      res.status(500).json({ 
        message: "Error getting document templates", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  apiRouter.get("/document-templates/:id", (req, res) => {
    try {
      const templateId = req.params.id;
      const template = getDocumentTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Document template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error getting document template:", error);
      res.status(500).json({ 
        message: "Error getting document template", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Document generation endpoint
  apiRouter.post("/documents/generate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { templateId, leadId, customFields } = req.body;
      
      if (!templateId) {
        return res.status(400).json({ message: "Template ID is required" });

  // Analytics routes
  apiRouter.get("/analytics/lead-sources", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user.id;
      const timeframe = req.query.timeframe || 'year';
      const result = await storage.getLeadSourcesAnalytics(userId, timeframe);
      res.json(result);
    } catch (error) {
      console.error("Error fetching lead sources analytics:", error);
      res.status(500).json({ message: "Error fetching analytics data" });
    }
  });

  apiRouter.get("/analytics/lead-activity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user.id;
      const timeframe = req.query.timeframe || 'year';
      const result = await storage.getLeadActivityAnalytics(userId, timeframe);
      res.json(result);
    } catch (error) {
      console.error("Error fetching lead activity analytics:", error);
      res.status(500).json({ message: "Error fetching analytics data" });
    }
  });

  apiRouter.get("/analytics/property-types", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user.id;
      const timeframe = req.query.timeframe || 'year';
      const result = await storage.getPropertyTypesAnalytics(userId, timeframe);
      res.json(result);
    } catch (error) {
      console.error("Error fetching property types analytics:", error);
      res.status(500).json({ message: "Error fetching analytics data" });
    }
  });

  apiRouter.get("/analytics/revenue", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user.id;
      const timeframe = req.query.timeframe || 'year';
      const result = await storage.getRevenueAnalytics(userId, timeframe);
      res.json(result);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Error fetching analytics data" });
    }
  });

      }
      
      const template = getDocumentTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Document template not found" });
      }
      
      const userId = req.user.id;
      
      const params: DocumentGenerationParams = {
        templateId,
        leadId: leadId ? parseInt(leadId) : undefined,
        userId,
        customFields
      };
      
      const document = await generateDocument(params);
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ 
        message: "Error generating document", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // AI Assistant chat endpoint
  apiRouter.post("/ai/chat", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages array is required" });
      }
      
      const userId = req.user.id;
      
      // Process the message with the AI assistant
      const response = await processUserMessage(messages, userId);
      
      res.json(response);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ 
        message: "Error processing chat message", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
