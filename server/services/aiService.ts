import { OpenAI } from "openai";
import { storage } from "../storage";
import { Lead, Document, Workflow, ScrapingJob } from "@shared/schema";
import { DocumentGenerationParams, generateDocument } from "./documentGenerationService";
import { scoreLeadWithAI } from "./leadScoringService";
import { runScrapingJob, createLeadFromScrapingResult } from "./scrapingService";

// Service constants
const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY || "";
const AZURE_ENDPOINT = "https://models.inference.ai.azure.com";
const DEPLOYMENT = "gpt-4o";

// Initialize OpenAI client with Azure configs
const openai = new OpenAI({
  apiKey: AZURE_API_KEY,
  baseURL: `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}`,
  defaultQuery: { "api-version": "2023-05-15" },
  defaultHeaders: { "api-key": AZURE_API_KEY }
});

/**
 * Message types for the AI assistant
 */
export type MessageRole = "system" | "user" | "assistant" | "function";

export interface AIMessage {
  role: MessageRole;
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

/**
 * Available tools that can be called by the AI
 */
interface Tool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

/**
 * Response from the AI processing
 */
export interface AIResponse {
  message: AIMessage;
  toolCalls?: {
    name: string;
    arguments: any;
    response: any;
  }[];
  error?: string;
}

// System prompt to guide the AI assistant's behavior
const SYSTEM_PROMPT = `You are Guru, the AI assistant for RezGuru AI, a real estate automation platform.
Follow these guidelines:

1. TONE: Be friendly but professional, like a savvy real estate mentor.
2. STYLE: Be concise (1-2 sentences for simple queries), with a touch of wit.
3. APPROACH: Be proactive and suggest next steps relevant to the user's context.

You have access to these capabilities:
- Find and analyze leads (property owners)
- Generate documents like contracts and offers
- Set up and run web scraping jobs for new leads
- Create automation workflows
- Score leads using AI
- Send messages to leads (SMS, email)

When you need data or to perform actions, use the appropriate function call.
Never fabricate information - if you don't have data, offer to help get it.

You're helping real estate investors automate their business and find deals more efficiently.
`;

// Define the available tools
const availableTools: Tool[] = [
  {
    type: "function",
    function: {
      name: "get_all_leads",
      description: "Get all leads for the current user",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "number",
            description: "The user ID to get leads for"
          },
          status: {
            type: "string",
            description: "Optional status to filter leads by"
          }
        },
        required: ["userId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_lead_details",
      description: "Get detailed information about a specific lead",
      parameters: {
        type: "object",
        properties: {
          leadId: {
            type: "number",
            description: "The ID of the lead to get details for"
          }
        },
        required: ["leadId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_lead",
      description: "Create a new lead in the system",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "number",
            description: "The user ID who owns this lead"
          },
          name: {
            type: "string",
            description: "Name of the lead"
          },
          email: {
            type: "string",
            description: "Email of the lead"
          },
          phone: {
            type: "string",
            description: "Phone number of the lead"
          },
          address: {
            type: "string",
            description: "Property address"
          },
          status: {
            type: "string",
            description: "Status of the lead (e.g., new, contacted, negotiating, closed, lost)"
          },
          source: {
            type: "string",
            description: "Source of the lead (e.g., website, referral, cold call)"
          },
          notes: {
            type: "string",
            description: "Additional notes about the lead"
          },
          motivationScore: {
            type: "number",
            description: "Motivation score (1-100)"
          }
        },
        required: ["userId", "name", "address"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_lead",
      description: "Update details for an existing lead",
      parameters: {
        type: "object",
        properties: {
          leadId: {
            type: "number",
            description: "The ID of the lead to update"
          },
          name: {
            type: "string",
            description: "Name of the lead"
          },
          email: {
            type: "string",
            description: "Email of the lead"
          },
          phone: {
            type: "string",
            description: "Phone number of the lead"
          },
          address: {
            type: "string",
            description: "Property address"
          },
          status: {
            type: "string",
            description: "Status of the lead (e.g., new, contacted, negotiating, closed, lost)"
          },
          notes: {
            type: "string",
            description: "Additional notes about the lead"
          },
          motivationScore: {
            type: "number",
            description: "Motivation score (1-100)"
          }
        },
        required: ["leadId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "score_lead",
      description: "Score a lead's motivation using AI",
      parameters: {
        type: "object",
        properties: {
          leadId: {
            type: "number",
            description: "The ID of the lead to score"
          }
        },
        required: ["leadId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_all_documents",
      description: "Get all documents for the current user",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "number",
            description: "The user ID to get documents for"
          },
          leadId: {
            type: "number",
            description: "Optional lead ID to filter documents by"
          }
        },
        required: ["userId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_document_details",
      description: "Get detailed information about a specific document",
      parameters: {
        type: "object",
        properties: {
          documentId: {
            type: "number",
            description: "The ID of the document to get details for"
          }
        },
        required: ["documentId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_document",
      description: "Generate a new document based on a template",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "number",
            description: "The user ID who owns this document"
          },
          templateId: {
            type: "string",
            description: "The ID of the template to use"
          },
          leadId: {
            type: "number",
            description: "The ID of the lead this document is for"
          },
          customFields: {
            type: "object",
            description: "Custom fields to use in the document"
          }
        },
        required: ["userId", "templateId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_available_templates",
      description: "Get a list of available document templates",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_all_workflows",
      description: "Get all automation workflows for the current user",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "number",
            description: "The user ID to get workflows for"
          }
        },
        required: ["userId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_workflow_details",
      description: "Get detailed information about a specific workflow",
      parameters: {
        type: "object",
        properties: {
          workflowId: {
            type: "number",
            description: "The ID of the workflow to get details for"
          }
        },
        required: ["workflowId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_workflow",
      description: "Create a new automation workflow",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "number",
            description: "The user ID who owns this workflow"
          },
          name: {
            type: "string",
            description: "Name of the workflow"
          },
          description: {
            type: "string",
            description: "Description of the workflow"
          },
          triggerType: {
            type: "string",
            description: "What triggers this workflow (e.g., manual, schedule, event)"
          },
          actions: {
            type: "array",
            description: "Array of actions in this workflow",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  description: "Type of action (e.g., filter, sms, email, call, delay, scrape, score, calculate, document)"
                },
                config: {
                  type: "object",
                  description: "Configuration for this action"
                }
              }
            }
          }
        },
        required: ["userId", "name", "actions"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "run_workflow",
      description: "Run a specific workflow",
      parameters: {
        type: "object",
        properties: {
          workflowId: {
            type: "number",
            description: "The ID of the workflow to run"
          }
        },
        required: ["workflowId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_all_scraping_jobs",
      description: "Get all scraping jobs for the current user",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "number",
            description: "The user ID to get scraping jobs for"
          }
        },
        required: ["userId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_scraping_job",
      description: "Create a new scraping job",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "number",
            description: "The user ID who owns this job"
          },
          name: {
            type: "string",
            description: "Name of the scraping job"
          },
          description: {
            type: "string",
            description: "Description of the scraping job"
          },
          sourceType: {
            type: "string",
            description: "Type of source to scrape (e.g., tax_delinquent, probate, fsbo)"
          },
          sourceUrl: {
            type: "string",
            description: "URL to scrape"
          },
          location: {
            type: "string",
            description: "Location to scrape (e.g., county, city, state)"
          },
          schedule: {
            type: "string",
            description: "Optional schedule for automatic running (e.g., daily, weekly)"
          },
          notes: {
            type: "string",
            description: "Additional notes about the scraping job"
          }
        },
        required: ["userId", "name", "sourceType", "sourceUrl"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "run_scraping_job",
      description: "Run a specific scraping job",
      parameters: {
        type: "object",
        properties: {
          jobId: {
            type: "number",
            description: "The ID of the scraping job to run"
          }
        },
        required: ["jobId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_recommendation",
      description: "Get AI recommendations for the user based on their data",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "number",
            description: "The user ID to get recommendations for"
          },
          recommendationType: {
            type: "string",
            description: "Type of recommendation (e.g., leads, areas, strategies)"
          }
        },
        required: ["userId"]
      }
    }
  }
];

/**
 * Process a user message and generate a response
 * @param messages Previous conversation messages
 * @param userId User ID for context
 * @returns AI response with message and any tool calls
 */
export async function processUserMessage(
  messages: AIMessage[],
  userId: number
): Promise<AIResponse> {
  try {
    // Add system message if not present
    if (!messages.some(m => m.role === "system")) {
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ];
    }

    // Call Azure OpenAI
    const response = await openai.chat.completions.create({
      model: DEPLOYMENT,
      messages: messages as any[],
      temperature: 0.7,
      max_tokens: 800,
      tools: availableTools as any[]
    });

    const aiMessage = response.choices[0].message;
    const toolCalls: { name: string; arguments: any; response: any }[] = [];

    // Process any tool calls
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      for (const toolCall of aiMessage.tool_calls) {
        if (toolCall.type === 'function') {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          
          // Execute the corresponding function
          let functionResponse;
          switch (functionName) {
            case 'get_all_leads':
              functionResponse = await getAllLeads(args.userId, args.status);
              break;
            case 'get_lead_details':
              functionResponse = await getLeadDetails(args.leadId);
              break;
            case 'create_lead':
              functionResponse = await createLead(args);
              break;
            case 'update_lead':
              functionResponse = await updateLead(args.leadId, args);
              break;
            case 'score_lead':
              functionResponse = await scoreLead(args.leadId);
              break;
            case 'get_all_documents':
              functionResponse = await getAllDocuments(args.userId, args.leadId);
              break;
            case 'get_document_details':
              functionResponse = await getDocumentDetails(args.documentId);
              break;
            case 'generate_document':
              functionResponse = await generateDocumentWithAI(args);
              break;
            case 'get_available_templates':
              functionResponse = await getAvailableTemplates();
              break;
            case 'get_all_workflows':
              functionResponse = await getAllWorkflows(args.userId);
              break;
            case 'get_workflow_details':
              functionResponse = await getWorkflowDetails(args.workflowId);
              break;
            case 'create_workflow':
              functionResponse = await createWorkflow(args);
              break;
            case 'run_workflow':
              functionResponse = await runWorkflowById(args.workflowId);
              break;
            case 'get_all_scraping_jobs':
              functionResponse = await getAllScrapingJobs(args.userId);
              break;
            case 'create_scraping_job':
              functionResponse = await createScrapingJob(args);
              break;
            case 'run_scraping_job':
              functionResponse = await runScrapingJobById(args.jobId);
              break;
            case 'get_recommendation':
              functionResponse = await getRecommendation(args.userId, args.recommendationType);
              break;
            default:
              functionResponse = { error: `Unknown function: ${functionName}` };
          }

          toolCalls.push({
            name: functionName,
            arguments: args,
            response: functionResponse
          });
        }
      }

      // If we have tool calls, we need to send a follow-up request with the tool results
      if (toolCalls.length > 0) {
        const followUpMessages = [
          ...messages,
          aiMessage,
          ...toolCalls.map(tool => ({
            role: "function" as MessageRole,
            name: tool.name,
            content: JSON.stringify(tool.response)
          }))
        ];

        // Get the final response that incorporates the tool results
        const followUpResponse = await openai.chat.completions.create({
          model: DEPLOYMENT,
          messages: followUpMessages as any[],
          temperature: 0.7,
          max_tokens: 800
        });

        const messageContent = followUpResponse.choices[0].message.content || "";
        return {
          message: {
            role: followUpResponse.choices[0].message.role as MessageRole,
            content: messageContent
          },
          toolCalls
        };
      }
    }

    // Return the original response if no tool calls
    return {
      message: {
        role: aiMessage.role as MessageRole,
        content: aiMessage.content || ""
      }
    };
  } catch (error) {
    console.error("Error processing message with Azure OpenAI:", error);
    return {
      message: {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again later."
      },
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Function implementations for the tools

async function getAllLeads(userId: number, status?: string): Promise<Lead[]> {
  try {
    if (status) {
      return await storage.getLeadsByStatus(userId, status);
    } else {
      return await storage.getLeads(userId);
    }
  } catch (error) {
    console.error("Error getting leads:", error);
    return [];
  }
}

async function getLeadDetails(leadId: number): Promise<Lead | { error: string }> {
  try {
    const lead = await storage.getLead(leadId);
    if (!lead) {
      return { error: `Lead with ID ${leadId} not found` };
    }
    return lead;
  } catch (error) {
    console.error("Error getting lead details:", error);
    return { error: "Failed to get lead details" };
  }
}

async function createLead(leadData: any): Promise<Lead | { error: string }> {
  try {
    return await storage.createLead(leadData);
  } catch (error) {
    console.error("Error creating lead:", error);
    return { error: "Failed to create lead" };
  }
}

async function updateLead(leadId: number, updates: any): Promise<Lead | { error: string }> {
  try {
    const updatedLead = await storage.updateLead(leadId, updates);
    if (!updatedLead) {
      return { error: `Lead with ID ${leadId} not found` };
    }
    return updatedLead;
  } catch (error) {
    console.error("Error updating lead:", error);
    return { error: "Failed to update lead" };
  }
}

async function scoreLead(leadId: number): Promise<{ score: number, analysis: string } | { error: string }> {
  try {
    const lead = await storage.getLead(leadId);
    if (!lead) {
      return { error: `Lead with ID ${leadId} not found` };
    }
    
    const result = await scoreLeadWithAI(lead);
    
    // Update the lead with the new score
    await storage.updateLead(leadId, { 
      motivationScore: result.score 
    });
    
    return result;
  } catch (error) {
    console.error("Error scoring lead:", error);
    return { error: "Failed to score lead" };
  }
}

async function getAllDocuments(userId: number, leadId?: number): Promise<Document[]> {
  try {
    if (leadId) {
      return await storage.getDocumentsByLead(leadId);
    } else {
      return await storage.getDocuments(userId);
    }
  } catch (error) {
    console.error("Error getting documents:", error);
    return [];
  }
}

async function getDocumentDetails(documentId: number): Promise<Document | { error: string }> {
  try {
    const document = await storage.getDocument(documentId);
    if (!document) {
      return { error: `Document with ID ${documentId} not found` };
    }
    return document;
  } catch (error) {
    console.error("Error getting document details:", error);
    return { error: "Failed to get document details" };
  }
}

async function generateDocumentWithAI(params: DocumentGenerationParams): Promise<Document | { error: string }> {
  try {
    return await generateDocument(params);
  } catch (error) {
    console.error("Error generating document:", error);
    return { error: "Failed to generate document" };
  }
}

async function getAvailableTemplates(): Promise<any[]> {
  try {
    // Import without the types to avoid circular dependencies
    const { getDocumentTemplates } = require("./documentGenerationService");
    return getDocumentTemplates();
  } catch (error) {
    console.error("Error getting templates:", error);
    return [];
  }
}

async function getAllWorkflows(userId: number): Promise<Workflow[]> {
  try {
    return await storage.getWorkflows(userId);
  } catch (error) {
    console.error("Error getting workflows:", error);
    return [];
  }
}

async function getWorkflowDetails(workflowId: number): Promise<Workflow | { error: string }> {
  try {
    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) {
      return { error: `Workflow with ID ${workflowId} not found` };
    }
    return workflow;
  } catch (error) {
    console.error("Error getting workflow details:", error);
    return { error: "Failed to get workflow details" };
  }
}

async function createWorkflow(workflowData: any): Promise<Workflow | { error: string }> {
  try {
    return await storage.createWorkflow(workflowData);
  } catch (error) {
    console.error("Error creating workflow:", error);
    return { error: "Failed to create workflow" };
  }
}

async function runWorkflowById(workflowId: number): Promise<{ success: boolean, message: string }> {
  try {
    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) {
      return { success: false, message: `Workflow with ID ${workflowId} not found` };
    }
    
    // Simplified workflow execution - in a real app this would be more complex
    // and would process each action in the workflow
    
    // Update last run time
    await storage.updateWorkflow(workflowId, {
      lastRun: new Date()
    });
    
    return { success: true, message: `Workflow '${workflow.name}' executed successfully` };
  } catch (error) {
    console.error("Error running workflow:", error);
    return { success: false, message: "Failed to run workflow" };
  }
}

async function getAllScrapingJobs(userId: number): Promise<ScrapingJob[]> {
  try {
    return await storage.getScrapingJobs(userId);
  } catch (error) {
    console.error("Error getting scraping jobs:", error);
    return [];
  }
}

async function createScrapingJob(jobData: any): Promise<ScrapingJob | { error: string }> {
  try {
    return await storage.createScrapingJob(jobData);
  } catch (error) {
    console.error("Error creating scraping job:", error);
    return { error: "Failed to create scraping job" };
  }
}

async function runScrapingJobById(jobId: number): Promise<{ success: boolean, results: any[] } | { error: string }> {
  try {
    const results = await runScrapingJob(jobId);
    
    if (!results) {
      return { error: "Failed to run scraping job" };
    }
    
    // Update the job's last run time
    await storage.updateScrapingJob(jobId, {
      lastRun: new Date()
    });
    
    return { success: true, results };
  } catch (error) {
    console.error("Error running scraping job:", error);
    return { error: "Failed to run scraping job" };
  }
}

// Define a type for recommendations
interface Recommendation {
  type: string;
  suggestions: string[];
}

async function getRecommendation(userId: number, recommendationType: string): Promise<Recommendation | { error: string }> {
  try {
    // Get all user data for context
    const leads = await storage.getLeads(userId);
    const workflows = await storage.getWorkflows(userId);
    const documents = await storage.getDocuments(userId);
    const scrapingJobs = await storage.getScrapingJobs(userId);
    
    // This would be a more complex AI call in a real implementation
    // For now, we'll return a simplified recommendation
    let recommendation: Recommendation = {
      type: recommendationType,
      suggestions: []
    };
    
    switch (recommendationType) {
      case "leads":
        recommendation.suggestions = [
          "Focus on tax delinquent leads - they have higher motivation scores",
          "Follow up with leads that have motivation scores > 80",
          "Consider creating more targeted scraping jobs for specific neighborhoods"
        ];
        break;
      case "areas":
        recommendation.suggestions = [
          "Phoenix market is showing strong distressed property opportunities",
          "Consider expanding scraping to include Miami and Atlanta",
          "Rural properties near metropolitan areas show good ROI potential"
        ];
        break;
      case "strategies":
        recommendation.suggestions = [
          "Implement a 3-touch follow-up sequence for all new leads",
          "Consider partnerships with local real estate agents for referrals",
          "Use AI-generated personalized offers to increase conversion rates"
        ];
        break;
      default:
        recommendation.suggestions = [
          "Set up automated workflows for lead nurturing",
          "Create document templates for common scenarios",
          "Implement regular scraping jobs for consistent lead generation"
        ];
    }
    
    return recommendation;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return { error: "Failed to generate recommendations" };
  }
}