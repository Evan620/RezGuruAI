import { OpenAI } from 'openai';
import { Lead } from '@shared/schema';

// Initialize OpenAI client with Azure configuration
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY || "",
  baseURL: "https://models.inference.ai.azure.com/openai/deployments/gpt-4o",
  defaultQuery: { "api-version": "2023-12-01-preview" },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY || "" }
});

/**
 * Lead scoring criteria based on real estate industry best practices
 */
const LEAD_SCORING_CRITERIA = {
  HIGH_MOTIVATION_KEYWORDS: [
    'foreclosure', 'divorce', 'bankruptcy', 'probate', 'death', 'inherited', 'tax lien',
    'underwater', 'behind on payments', 'late payments', 'distressed', 'motivated',
    'urgent', 'desperate', 'need to sell fast', 'relocating', 'job transfer',
    'new job', 'financial hardship', 'unemployment', 'vacant', 'empty',
    'code violation', 'repairs needed', 'bad tenant', 'problem tenant'
  ],
  LEAD_SOURCES_PRIORITY: {
    tax_delinquent: 9,
    probate: 8,
    foreclosure: 8,
    fsbo: 7,
    divorce: 7,
    vacant: 6,
    code_violation: 6,
    tired_landlord: 5,
    referral: 4,
    website: 3,
    zillow: 2,
    facebook: 2,
    general_marketing: 1
  }
};

/**
 * Score a lead using AI analysis
 * @param lead Lead object to score
 * @returns Promise with scoring result including score and analysis
 */
export async function scoreLeadWithAI(lead: Lead): Promise<{
  score: number;
  analysis: string;
  motivators: string[];
}> {
  try {
    // If Azure OpenAI key is not available, use rule-based scoring
    if (!process.env.AZURE_OPENAI_API_KEY) {
      console.log("Azure OpenAI API key not available, using rule-based scoring");
      return calculateRuleBasedScore(lead);
    }

    // Get all available lead information for analysis
    const leadInfo = {
      name: lead.name,
      address: lead.address || 'Unknown',
      source: lead.source,
      notes: lead.notes || '',
      status: lead.status,
      amountOwed: lead.amountOwed || 'None'
    };

    // Create system message and user prompt for analysis
    const systemMessage = "You are a real estate lead analysis expert. Respond only with JSON.";
    
    const userPrompt = `
      Analyze this real estate lead's information and score their motivation to sell on a scale of 1-100, where 100 is extremely motivated.
      
      Lead Information:
      - Name: ${leadInfo.name}
      - Address: ${leadInfo.address}
      - Lead Source: ${leadInfo.source}
      - Status: ${leadInfo.status}
      - Amount Owed: ${leadInfo.amountOwed}
      - Notes: ${leadInfo.notes}
      
      Consider the following:
      1. Lead source (tax_delinquent, probate, and foreclosure sources indicate higher motivation)
      2. Financial distress indicators (amounts owed, tax issues)
      3. Life circumstances mentioned in notes (divorce, job loss, inheritance, relocation, etc.)
      4. Property condition issues
      5. Urgency factors
      
      Provide:
      1. A single numerical score between 1-100
      2. A brief analysis explaining the score
      3. A list of key motivators identified (e.g., "tax delinquency", "divorce", "relocation")
      
      Format your response as valid JSON with fields: score, analysis, and motivators array.
    `;

    // Use Azure OpenAI to analyze the lead
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using the deployment model name directly
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    // Parse and validate the response
    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      console.error("Empty response from Azure OpenAI");
      return calculateRuleBasedScore(lead);
    }

    try {
      const parsedResult = JSON.parse(responseText);
      
      // Validate and sanitize the score (ensure it's between 1-100)
      const score = typeof parsedResult.score === 'number' 
        ? Math.min(100, Math.max(1, Math.round(parsedResult.score))) 
        : 50;
        
      return {
        score: score,
        analysis: parsedResult.analysis || 'No analysis provided',
        motivators: Array.isArray(parsedResult.motivators) ? parsedResult.motivators : []
      };
    } catch (parseError) {
      console.error("Error parsing Azure OpenAI response:", parseError);
      return calculateRuleBasedScore(lead);
    }
  } catch (error) {
    console.error("Error in AI lead scoring:", error);
    // Fallback to rule-based scoring if AI fails
    return calculateRuleBasedScore(lead);
  }
}

/**
 * Calculate a rule-based score when AI is not available
 * @param lead Lead to score 
 * @returns Score calculation result
 */
function calculateRuleBasedScore(lead: Lead): {
  score: number;
  analysis: string;
  motivators: string[];
} {
  let score = 50; // Default middle score
  const motivators: string[] = [];
  
  // Add points based on lead source
  const sourceScore = LEAD_SCORING_CRITERIA.LEAD_SOURCES_PRIORITY[lead.source as keyof typeof LEAD_SCORING_CRITERIA.LEAD_SOURCES_PRIORITY] || 1;
  score += sourceScore * 5; // Scale to have more impact (max +45)
  
  if (sourceScore > 5) {
    motivators.push(lead.source.replace('_', ' '));
  }
  
  // Check notes for motivation keywords
  let keywordMatches = 0;
  if (lead.notes) {
    const notesLower = lead.notes.toLowerCase();
    
    LEAD_SCORING_CRITERIA.HIGH_MOTIVATION_KEYWORDS.forEach(keyword => {
      if (notesLower.includes(keyword.toLowerCase())) {
        keywordMatches++;
        // Only add unique motivators
        if (!motivators.includes(keyword)) {
          motivators.push(keyword);
        }
      }
    });
  }
  
  // Add points for keyword matches (max +20)
  score += Math.min(keywordMatches * 5, 20);
  
  // Check for amount owed (financial distress)
  if (lead.amountOwed) {
    // Try to extract numeric value from amount string
    const amountMatch = lead.amountOwed.match(/(\d+)/);
    if (amountMatch && amountMatch[1]) {
      const amount = parseInt(amountMatch[1], 10);
      if (amount > 1000) {
        score += 10;
        motivators.push('financial distress');
      }
    }
  }
  
  // Ensure score is between 1-100
  score = Math.min(100, Math.max(1, score));
  
  return {
    score,
    analysis: `Rule-based score of ${score} calculated based on lead source (${lead.source}) and ${keywordMatches} motivation keywords found.`,
    motivators
  };
}

/**
 * Updates a lead with a new motivation score
 * @param leadId ID of the lead to update
 * @param score New motivation score
 */
export async function updateLeadMotivationScore(lead: Lead, scoringResult: {
  score: number;
  analysis: string;
  motivators: string[];
}): Promise<Lead> {
  // This would typically update the lead in the database
  // For now, we'll just return the updated lead object
  return {
    ...lead,
    motivationScore: scoringResult.score,
    notes: lead.notes 
      ? `${lead.notes}\n\nAI Analysis: ${scoringResult.analysis}` 
      : `AI Analysis: ${scoringResult.analysis}`
  };
}