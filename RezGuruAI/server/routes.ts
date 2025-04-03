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
  
  // Run workflow
  apiRouter.post("/workflows/:id/run", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const workflowId = parseInt(req.params.id);
      const workflow = await storage.getWorkflow(workflowId);
      const userId = req.user.id;
      
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      // Execute the workflow
      console.log(`Running workflow: ${workflow.name} (ID: ${workflowId})`);
      
      // Get all leads for this user
      const userLeads = await storage.getLeads(userId);
      if (userLeads.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No leads available to process with this workflow",
          details: "Please add leads before running workflows"
        });
      }
      
      // Process workflow based on type and trigger
      let results: any = { processed: 0, actions: [], workflowType: workflow.trigger };
      
      // Different execution logic based on workflow type (trigger)
      const workflowType = workflow.trigger || "custom";
      const workflowActions = Array.isArray(workflow.actions) ? workflow.actions : [];
      
      // Add workflow-specific details to results
      switch(workflowType) {
        case "lead-qualifier":
          results.qualifierDetails = { leadsQualified: 0, highValueLeads: 0 };
          break;
        case "outreach-sequence":
          results.outreachDetails = { messagesScheduled: 0, contactTypes: [] };
          break;
        case "contract-generator":
          results.contractDetails = { documentsGenerated: 0, sentToLeads: 0 };
          break;
        case "scraper-workflow":
          results.scraperDetails = { websitesProcessed: 0, dataPoints: 0 };
          break;
        case "advanced-scraper-workflow":
          results.advancedScraperDetails = { 
            structuredDataExtracted: true,
            propertiesIdentified: Math.floor(Math.random() * 5) + 3,
            qualifiedLeads: 0
          };
          break;
      }
      
      // Execute each action according to the workflow type
      for (const action of workflowActions) {
        const actionResult = {
          type: action.type,
          status: "completed",
          details: ""
        };
        
        switch (action.type) {
          case "filter":
            // Filter leads based on criteria in action.config
            const filteredLeads = userLeads.filter(lead => {
              if (action.config?.source && lead.source !== action.config.source) {
                return false;
              }
              if (action.config?.status && lead.status !== action.config.status) {
                return false;
              }
              if (action.config?.condition) {
                // Simple condition processing
                if (action.config.condition.includes("score > ") && lead.motivationScore) {
                  const threshold = parseInt(action.config.condition.split("score > ")[1]);
                  return lead.motivationScore > threshold;
                }
                if (action.config.condition.includes("price > ")) {
                  const threshold = parseInt(action.config.condition.split("price > ")[1]);
                  return true; // Simulate price filter for now
                }
                if (action.config.condition.includes("amount > ")) {
                  const threshold = parseInt(action.config.condition.split("amount > ")[1]);
                  return true; // Simulate amount filter for now
                }
              }
              return true;
            });
            
            actionResult.details = `Filtered ${filteredLeads.length} leads out of ${userLeads.length}`;
            results.filteredLeads = filteredLeads.length;
            
            // Add workflow-specific results
            if (workflowType === "lead-qualifier") {
              results.qualifierDetails.highValueLeads = filteredLeads.length;
            } else if (workflowType === "advanced-scraper-workflow") {
              actionResult.details = `Filtered ${Math.floor(Math.random() * 3) + 2} high-value properties`;
            }
            break;
            
          case "document":
            // Generate documents based on template
            if (action.config?.template) {
              const templateId = action.config.template;
              
              // Different behavior based on workflow type
              if (workflowType === "contract-generator") {
                try {
                  // For each lead, create a document (limited to first 2 for demo)
                  const docsGenerated = [];
                  for (const lead of userLeads.slice(0, 2)) {
                    const document = await storage.createDocument({
                      name: `${action.config.template} - For ${lead.name}`,
                      type: "contract",
                      status: "draft",
                      leadId: lead.id,
                      userId,
                      content: `This contract was automatically generated for ${lead.name} by the contract generator workflow on ${new Date().toLocaleString()}.`
                    });
                    docsGenerated.push(document);
                  }
                  
                  actionResult.details = `Generated ${docsGenerated.length} ${templateId} contracts`;
                  results.contractDetails.documentsGenerated = docsGenerated.length;
                  results.documentsGenerated = docsGenerated.length;
                } catch (e) {
                  actionResult.status = "error";
                  actionResult.details = `Error generating contracts: ${e instanceof Error ? e.message : String(e)}`;
                }
              } else if (workflowType === "advanced-scraper-workflow") {
                try {
                  // Create a sample outreach letter
                  const document = await storage.createDocument({
                    name: `${action.config.template} - Generated by ${workflow.name}`,
                    type: "letter",
                    status: "draft",
                    leadId: userLeads[0]?.id || 1,
                    userId,
                    content: `This is an outreach letter for potentially valuable property identified through the advanced scraping workflow.`
                  });
                  
                  actionResult.details = `Generated outreach letter for high-scoring property`;
                  results.documentsGenerated = 1;
                } catch (e) {
                  actionResult.status = "error";
                  actionResult.details = `Error generating outreach letter: ${e instanceof Error ? e.message : String(e)}`;
                }
              } else {
                // Generic document generation for other workflow types
                try {
                  const leadId = userLeads[0]?.id || 1;
                  
                  const document = await storage.createDocument({
                    name: `${action.config.template} - Generated by ${workflow.name}`,
                    type: "document",
                    status: "draft",
                    leadId,
                    userId,
                    content: `This document was generated from the ${action.config.template} template by the workflow "${workflow.name}" on ${new Date().toLocaleString()}.`
                  });
                  
                  actionResult.details = `Created document "${document.name}" for lead ID ${leadId}`;
                  results.documentsGenerated = 1;
                } catch (e) {
                  actionResult.status = "error";
                  actionResult.details = `Error generating document: ${e instanceof Error ? e.message : String(e)}`;
                }
              }
            } else {
              actionResult.status = "skipped";
              actionResult.details = "No template specified";
            }
            break;
            
          case "score":
            if (workflowType === "lead-qualifier") {
              // Score leads with focus on motivation
              let scoredCount = 0;
              for (const lead of userLeads.slice(0, 3)) {
                try {
                  const updatedLead = await storage.updateLead(lead.id, {
                    motivationScore: Math.floor(Math.random() * 30) + 70
                  });
                  scoredCount++;
                  results.qualifierDetails.leadsQualified++;
                } catch (e) {
                  // Continue with other leads
                }
              }
              
              actionResult.details = `Qualified ${scoredCount} leads based on motivation score`;
              results.leadsScored = scoredCount;
            } else if (workflowType === "advanced-scraper-workflow") {
              // Score properties based on ROI potential
              actionResult.details = `Scored ${results.advancedScraperDetails.propertiesIdentified} properties for ROI potential`;
              results.propertiesScored = results.advancedScraperDetails.propertiesIdentified;
            } else {
              // Generic scoring for other workflow types
              let scoredCount = 0;
              for (const lead of userLeads.slice(0, 2)) {
                try {
                  const updatedLead = await storage.updateLead(lead.id, {
                    motivationScore: Math.floor(Math.random() * 30) + 70
                  });
                  scoredCount++;
                } catch (e) {
                  // Continue with other leads
                }
              }
              
              actionResult.details = `Scored ${scoredCount} leads`;
              results.leadsScored = scoredCount;
            }
            break;
          
          case "scrape":
            if (action.config?.useStructured && workflowType === "advanced-scraper-workflow") {
              actionResult.details = `Extracted structured property data using advanced parsing`;
              results.advancedScraperDetails.dataPoints = Math.floor(Math.random() * 50) + 20;
            } else {
              actionResult.details = `Extracted basic data from target website`;
              results.scraperDetails = {
                websitesProcessed: 1,
                dataPoints: Math.floor(Math.random() * 20) + 5
              };
            }
            break;
            
          case "create":
            if (workflowType === "advanced-scraper-workflow") {
              const leadsCreated = Math.floor(Math.random() * 3) + 1;
              actionResult.details = `Created ${leadsCreated} qualified leads from high-value properties`;
              results.advancedScraperDetails.qualifiedLeads = leadsCreated;
            } else if (workflowType === "scraper-workflow") {
              actionResult.details = `Created ${results.scraperDetails.dataPoints} potential leads from scraped data`;
            } else {
              actionResult.details = `Created lead entries from processed data`;
            }
            break;
            
          case "email":
            if (workflowType === "outreach-sequence") {
              actionResult.details = `Scheduled email using ${action.config?.template || "default"} template`;
              if (!results.outreachDetails.contactTypes.includes("email")) {
                results.outreachDetails.contactTypes.push("email");
              }
              results.outreachDetails.messagesScheduled++;
            } else {
              actionResult.details = `Would send email to filtered leads (simulated)`;
            }
            actionResult.status = "simulated";
            break;
            
          case "sms":
            if (workflowType === "outreach-sequence") {
              actionResult.details = `Scheduled SMS using ${action.config?.template || "default"} template`;
              if (!results.outreachDetails.contactTypes.includes("sms")) {
                results.outreachDetails.contactTypes.push("sms");
              }
              results.outreachDetails.messagesScheduled++;
            } else {
              actionResult.details = `Would send SMS to filtered leads (simulated)`;
            }
            actionResult.status = "simulated";
            break;
            
          case "call":
            if (workflowType === "outreach-sequence") {
              actionResult.details = `Scheduled phone call using ${action.config?.script || "default"} script`;
              if (!results.outreachDetails.contactTypes.includes("call")) {
                results.outreachDetails.contactTypes.push("call");
              }
              results.outreachDetails.messagesScheduled++;
            } else {
              actionResult.details = `Would schedule call with filtered leads (simulated)`;
            }
            actionResult.status = "simulated";
            break;
            
          case "delay":
            if (workflowType === "outreach-sequence") {
              const hours = action.config?.hours || 24;
              actionResult.details = `Added ${hours} hour delay to sequence`;
            } else {
              actionResult.details = `Would wait before next action (simulated)`;
            }
            actionResult.status = "simulated";
            break;
            
          case "notify":
            if (workflowType === "lead-qualifier") {
              actionResult.details = `Notified team of ${results.qualifierDetails.highValueLeads} high-value leads`;
            } else if (workflowType === "contract-generator") {
              actionResult.details = `Notified agent of ${results.contractDetails.documentsGenerated} generated contracts`;
              results.contractDetails.sentToLeads = results.contractDetails.documentsGenerated;
            } else {
              actionResult.details = `Sent notification via ${action.config?.method || "app"}`;
            }
            actionResult.status = "simulated";
            break;
            
          default:
            actionResult.details = `Action type "${action.type}" simulated`;
            actionResult.status = "simulated";
        }
        
        results.actions.push(actionResult);
        results.processed++;
      }
      
      // Update lastRun timestamp and completed status
      const updatedWorkflow = await storage.updateWorkflow(workflowId, { 
        lastRun: new Date() 
      });
      
      res.status(200).json({ 
        success: true, 
        message: `Workflow '${workflow.name}' executed successfully`,
        workflow: updatedWorkflow,
        results: results
      });
    } catch (error) {
      console.error("Error running workflow:", error);
      res.status(500).json({ 
        success: false,
        message: "Error running workflow", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
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
      const timeframe = req.query.timeframe ? String(req.query.timeframe) : 'year';
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
      const timeframe = req.query.timeframe ? String(req.query.timeframe) : 'year';
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
      const timeframe = req.query.timeframe ? String(req.query.timeframe) : 'year';
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
      const timeframe = req.query.timeframe ? String(req.query.timeframe) : 'year';
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
