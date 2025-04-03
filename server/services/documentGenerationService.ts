import { Lead, Document, InsertDocument } from "@shared/schema";
import { storage } from "../storage";
import { v4 as uuidv4 } from "uuid";
import { OpenAI } from "openai";

// Document template types
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  template: string;
}

// Common templates
const documentTemplates: DocumentTemplate[] = [
  {
    id: "purchase-offer",
    name: "Purchase Offer",
    description: "Standard real estate purchase offer for residential properties",
    type: "offer",
    template: `
REAL ESTATE PURCHASE OFFER

Date: {{currentDate}}

BUYER: {{buyerName}}
SELLER: {{sellerName}}
PROPERTY ADDRESS: {{propertyAddress}}
LEGAL DESCRIPTION: {{legalDescription}}

1. OFFER TO PURCHASE
   Buyer offers to purchase the above property for the sum of {{offerAmount}} (US Dollars).

2. EARNEST MONEY
   Buyer will deposit earnest money in the amount of {{earnestMoney}} with {{escrowCompany}}.

3. FINANCING
   This offer is contingent upon Buyer obtaining financing within {{financingPeriod}} days.

4. CLOSING DATE
   The closing of this transaction shall take place on or before {{closingDate}}.

5. INSPECTIONS
   Buyer has the right to conduct inspections within {{inspectionPeriod}} days after acceptance.

6. PROPERTY CONDITION
   The property will be sold in its present condition except as specified herein.

7. SPECIAL PROVISIONS
   {{specialProvisions}}

8. ACCEPTANCE DEADLINE
   This offer shall be open for acceptance until {{acceptanceDeadline}}.

BUYER:
_____________________________ Date: __________
{{buyerName}}

ACCEPTANCE:
SELLER:
_____________________________ Date: __________
{{sellerName}}
    `
  },
  {
    id: "property-assessment",
    name: "Property Assessment",
    description: "Detailed assessment of property value and condition",
    type: "assessment",
    template: `
PROPERTY ASSESSMENT REPORT

Date: {{currentDate}}
Property Address: {{propertyAddress}}
Owner: {{ownerName}}
Assessment Requested By: {{requestedBy}}

1. PROPERTY DETAILS
   Type: {{propertyType}}
   Year Built: {{yearBuilt}}
   Square Footage: {{squareFootage}}
   Lot Size: {{lotSize}}
   Bedrooms: {{bedrooms}}
   Bathrooms: {{bathrooms}}

2. NEIGHBORHOOD ANALYSIS
   {{neighborhoodAnalysis}}

3. PROPERTY CONDITION
   Foundation: {{foundationCondition}}
   Roof: {{roofCondition}}
   Exterior: {{exteriorCondition}}
   Interior: {{interiorCondition}}
   Electrical: {{electricalCondition}}
   Plumbing: {{plumbingCondition}}
   HVAC: {{hvacCondition}}

4. MARKET ANALYSIS
   Comparable Sales:
   {{comparableSales}}

5. VALUATION
   Estimated Market Value: {{estimatedValue}}
   Confidence Level: {{confidenceLevel}}

6. INVESTMENT ANALYSIS
   Potential Rental Income: {{potentialRent}}
   Estimated Expenses: {{estimatedExpenses}}
   Projected ROI: {{projectedROI}}

7. RENOVATION RECOMMENDATIONS
   {{renovationRecommendations}}

8. CONCLUSION
   {{conclusion}}

Assessment Conducted By: {{assessorName}}
License Number: {{assessorLicense}}
    `
  },
  {
    id: "lease-agreement",
    name: "Residential Lease Agreement",
    description: "Standard residential property lease agreement",
    type: "lease",
    template: `
RESIDENTIAL LEASE AGREEMENT

THIS LEASE AGREEMENT (hereinafter referred to as the "Agreement") made and entered into this {{startDate}}, by and between {{landlordName}} (hereinafter referred to as "Landlord") and {{tenantName}} (hereinafter referred to as "Tenant").

PROPERTY: Landlord hereby leases to Tenant and Tenant hereby leases from Landlord for the term of this Agreement the premises described as follows:
{{propertyAddress}}

TERM: The term of this Agreement shall begin on {{leaseStartDate}} and end on {{leaseEndDate}}.

RENT: Tenant agrees to pay, without demand, to Landlord as rent for the Property the sum of {{monthlyRent}} per month, in advance, on the first day of each calendar month.

SECURITY DEPOSIT: On execution of this Agreement, Tenant has deposited with Landlord the sum of {{securityDeposit}}, receipt of which is acknowledged by Landlord, as security for the faithful performance by Tenant of the terms hereof.

UTILITIES: Tenant shall be responsible for the payment of all utilities and services to the Property, except for the following which shall be paid by Landlord: {{utilitiesPaidByLandlord}}.

MAINTENANCE: Tenant shall maintain the Property in a clean and sanitary manner including all equipment, appliances, furniture and furnishings therein and shall surrender the same, at termination, in as good condition as received, normal wear and tear excepted.

USE OF PROPERTY: The Property shall be used and occupied by Tenant exclusively as a residence. Neither the Property nor any part thereof shall be used at any time during the term of this Agreement for any purpose other than as a private residence.

PETS: Tenant shall not keep any pets on the Property without the prior written consent of the Landlord. {{petPolicy}}

ALTERATIONS AND IMPROVEMENTS: Tenant shall make no alterations to the Property without the prior written consent of Landlord.

DEFAULT: If Tenant fails to comply with any of the terms of this Agreement, Landlord may terminate this Agreement and proceed with eviction as provided by local law.

SIGNATURES:

_____________________________ Date: __________
{{landlordName}} (Landlord)

_____________________________ Date: __________
{{tenantName}} (Tenant)
    `
  },
  {
    id: "follow-up-letter",
    name: "Lead Follow-up Letter",
    description: "Letter for following up with a potential seller lead",
    type: "follow-up",
    template: `
{{currentDate}}

{{recipientName}}
{{recipientAddress}}
{{recipientCity}}, {{recipientState}} {{recipientZip}}

RE: Property at {{propertyAddress}}

Dear {{salutation}},

I hope this letter finds you well. My name is {{agentName}} with {{companyName}}. I'm reaching out because I understand you may be considering selling your property at {{propertyAddress}}.

As a real estate professional specializing in the {{neighborhoodName}} area, I wanted to introduce myself and offer my assistance. The current market conditions are {{marketConditions}}, and properties like yours are in {{demandLevel}} demand.

Based on recent comparable sales in your area, properties similar to yours have been selling for approximately {{estimatedValue}}. I'd be happy to provide you with a more detailed market analysis at no cost or obligation.

If you're interested in exploring your options, I'd welcome the opportunity to meet with you to discuss:

1. Current market value of your property
2. Potential improvements that could increase your property's value
3. Our marketing strategy to attract qualified buyers
4. Timeline and process for selling your property

Please feel free to contact me at {{agentPhone}} or {{agentEmail}} if you have any questions or would like to schedule a consultation.

Thank you for your consideration. I look forward to the possibility of working with you.

Sincerely,

{{agentName}}
{{agentTitle}}
{{companyName}}
{{agentPhone}}
{{agentEmail}}
    `
  },
  {
    id: "buyer-qualification",
    name: "Buyer Qualification Form",
    description: "Form for qualifying potential property buyers",
    type: "qualification",
    template: `
BUYER QUALIFICATION FORM

Date: {{currentDate}}

PERSONAL INFORMATION:
Name: {{buyerName}}
Phone: {{buyerPhone}}
Email: {{buyerEmail}}
Current Address: {{buyerAddress}}
Preferred Contact Method: {{preferredContactMethod}}

BUYING PREFERENCES:
Property Type(s): {{propertyTypes}}
Desired Location(s): {{desiredLocations}}
Bedrooms: {{bedroomsNeeded}}
Bathrooms: {{bathroomsNeeded}}
Budget Range: {{budgetMin}} - {{budgetMax}}
Must-Have Features: {{mustHaveFeatures}}
Deal-Breakers: {{dealBreakers}}
Desired Move-In Date: {{moveInDate}}

FINANCING INFORMATION:
Pre-Approved for Financing: {{preApproved}} (Yes/No)
If Yes, Pre-Approval Amount: {{preApprovalAmount}}
Lender Name: {{lenderName}}
Lender Contact: {{lenderContact}}
Down Payment Available: {{downPaymentAmount}}
Financing Type: {{financingType}} (Conventional, FHA, VA, etc.)
Credit Score Range: {{creditScoreRange}}

CURRENT HOUSING SITUATION:
Own or Rent: {{currentHousingStatus}}
If Selling, Current Home Status: {{currentHomeStatus}}
Timeline Constraints: {{timelineConstraints}}

ADDITIONAL NOTES:
{{additionalNotes}}

By signing below, I confirm that the information provided is accurate to the best of my knowledge.

Signature: _____________________________ Date: __________
{{buyerName}}

Agent: _____________________________ Date: __________
{{agentName}}
    `
  }
];

// Azure OpenAI client
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://models.inference.ai.azure.com";
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentName = "gpt-4o";

// Document generation parameters
export interface DocumentGenerationParams {
  templateId: string;
  leadId?: number;
  userId: number;
  customFields?: Record<string, string>;
}

/**
 * Generate a document from a template
 */
export async function generateDocument(params: DocumentGenerationParams): Promise<Document> {
  try {
    // Get the template
    const template = documentTemplates.find(t => t.id === params.templateId);
    if (!template) {
      throw new Error(`Template with ID ${params.templateId} not found`);
    }
    
    // Get lead data if leadId is provided
    let lead: Lead | undefined;
    if (params.leadId) {
      lead = await storage.getLead(params.leadId);
      if (!lead) {
        throw new Error(`Lead with ID ${params.leadId} not found`);
      }
    }
    
    // Generate document content based on the template
    const documentContent = await populateTemplate(template, lead, params.customFields);
    
    // Generate a unique document name
    const documentName = lead 
      ? `${template.name} - ${lead.address || lead.name}` 
      : `${template.name} - ${new Date().toLocaleDateString()}`;
    
    // Create the document in storage
    const newDocument: InsertDocument = {
      name: documentName,
      type: template.type,
      content: documentContent,
      status: "draft",
      leadId: params.leadId,
      userId: params.userId
    };
    
    return await storage.createDocument(newDocument);
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
}

/**
 * Get all available document templates
 */
export function getDocumentTemplates(): DocumentTemplate[] {
  return documentTemplates;
}

/**
 * Get a specific document template by ID
 */
export function getDocumentTemplate(templateId: string): DocumentTemplate | undefined {
  return documentTemplates.find(t => t.id === templateId);
}

/**
 * Populate a template with lead data and custom fields
 */
async function populateTemplate(
  template: DocumentTemplate, 
  lead?: Lead, 
  customFields?: Record<string, string>
): Promise<string> {
  // If we have Azure OpenAI credentials, use AI to generate the document
  if (apiKey) {
    return await generateDocumentWithAI(template, lead, customFields);
  }
  
  // Otherwise, do basic template replacement
  let content = template.template;
  
  // Add current date
  content = content.replace(/{{currentDate}}/g, new Date().toLocaleDateString());
  
  // Add lead data if available
  if (lead) {
    content = content.replace(/{{sellerName}}/g, lead.name || "");
    content = content.replace(/{{propertyAddress}}/g, lead.address || "");
    content = content.replace(/{{recipientName}}/g, lead.name || "");
    content = content.replace(/{{recipientAddress}}/g, lead.address || "");
    content = content.replace(/{{recipientCity}}/g, lead.city || "");
    content = content.replace(/{{recipientState}}/g, lead.state || "");
    content = content.replace(/{{recipientZip}}/g, lead.zip || "");
    content = content.replace(/{{ownerName}}/g, lead.name || "");
  }
  
  // Add custom fields
  if (customFields) {
    for (const [key, value] of Object.entries(customFields)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    }
  }
  
  return content;
}

/**
 * Generate a document using Azure OpenAI
 */
async function generateDocumentWithAI(
  template: DocumentTemplate, 
  lead?: Lead, 
  customFields?: Record<string, string>
): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("Azure OpenAI API key is required");
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: `${endpoint}/openai/deployments/${deploymentName}`,
      defaultQuery: { "api-version": "2023-05-15" },
      defaultHeaders: { "api-key": apiKey }
    });
    
    // Create a prompt for the AI to generate the document
    let prompt = `You are an expert in real estate documents. Please create a ${template.name} based on the following template and information:\n\n`;
    prompt += `Template: ${template.template}\n\n`;
    
    if (lead) {
      prompt += `Lead Information:\n`;
      prompt += `Name: ${lead.name || 'Unknown'}\n`;
      prompt += `Address: ${lead.address || 'Unknown'}\n`;
      prompt += `City: ${lead.city || 'Unknown'}\n`;
      prompt += `State: ${lead.state || 'Unknown'}\n`;
      prompt += `Zip: ${lead.zip || 'Unknown'}\n`;
      prompt += `Phone: ${lead.phone || 'Unknown'}\n`;
      prompt += `Email: ${lead.email || 'Unknown'}\n`;
      prompt += `Source: ${lead.source || 'Unknown'}\n`;
      prompt += `Status: ${lead.status || 'Unknown'}\n`;
      prompt += `Notes: ${lead.notes || 'N/A'}\n\n`;
    }
    
    if (customFields) {
      prompt += `Custom Fields:\n`;
      for (const [key, value] of Object.entries(customFields)) {
        prompt += `${key}: ${value}\n`;
      }
      prompt += `\n`;
    }
    
    prompt += `Please replace all placeholders in the template with appropriate values based on the information provided. For any missing information, use reasonable default values that would make sense in a real estate context. Keep the document format exactly the same as the template, just fill in the placeholders. Don't add any explanation or additional text outside the document format.`;
    
    // Call the Azure OpenAI API
    const result = await openai.chat.completions.create({
      model: deploymentName,
      messages: [
        { role: "system", content: "You are an expert in real estate documents that generates accurate, professional documents based on templates and available information." },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.5,
    });
    
    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
      return result.choices[0].message.content || "Error generating document content";
    } else {
      throw new Error("No response from Azure OpenAI");
    }
  } catch (error) {
    console.error("Error calling Azure OpenAI:", error);
    
    // Fall back to template-based generation
    let content = template.template;
    
    // Add current date
    content = content.replace(/{{currentDate}}/g, new Date().toLocaleDateString());
    
    // Add lead data if available
    if (lead) {
      content = content.replace(/{{sellerName}}/g, lead.name || "");
      content = content.replace(/{{propertyAddress}}/g, lead.address || "");
      content = content.replace(/{{recipientName}}/g, lead.name || "");
      content = content.replace(/{{recipientAddress}}/g, lead.address || "");
      content = content.replace(/{{recipientCity}}/g, lead.city || "");
      content = content.replace(/{{recipientState}}/g, lead.state || "");
      content = content.replace(/{{recipientZip}}/g, lead.zip || "");
      content = content.replace(/{{ownerName}}/g, lead.name || "");
    }
    
    // Add custom fields
    if (customFields) {
      for (const [key, value] of Object.entries(customFields)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
      }
    }
    
    return content;
  }
}