import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqItems = [
    {
      id: "item-1",
      question: "How do I scrape tax delinquent properties?",
      answer: "Navigate to the 'Data Scraping' page and create a new scraping job. Select 'Tax Delinquent' as the source type, and enter the URL of your county's tax delinquent list. RezGuru AI will automatically extract the property information and create leads."
    },
    {
      id: "item-2",
      question: "How does the AI lead scoring work?",
      answer: "Our AI lead scoring analyzes various factors including property characteristics, owner situation, and market conditions to assign a motivation score from 0-100. Leads with scores above 80 are considered high-motivation sellers. The AI model is powered by HuggingFace's Zephyr-7B and continually improves as you use the system."
    },
    {
      id: "item-3",
      question: "How do I set up automated SMS follow-ups?",
      answer: "Go to the 'Automations' page and create a new workflow. Select 'Outreach Sequence' as the template, then configure your SMS messages and timing. You can set conditions based on lead status, score, or previous interactions."
    },
    {
      id: "item-4",
      question: "Can I generate custom offer documents?",
      answer: "Yes! Visit the 'Documents' page and click 'Create Document'. Select a template like 'Cash Offer' and fill in the required fields. The system will automatically generate a professional PDF document that you can download or send directly to leads."
    },
    {
      id: "item-5",
      question: "What's the difference between the Free and Pro plans?",
      answer: "The Free plan includes 100 leads per month, basic SMS functionality, and limited automation. The Pro plan ($29/month) unlocks unlimited leads, AI scoring, unlimited automations, and priority support. There's also a White-label plan ($299/month) for agencies with custom branding and API access."
    },
    {
      id: "item-6",
      question: "How do I interpret the motivation score?",
      answer: "Motivation scores range from 0-100. Scores 80+ indicate highly motivated sellers likely to accept discounted offers. Scores 60-79 suggest moderate motivation, while scores below 60 typically represent testing-the-market sellers. We recommend prioritizing leads with scores above 70."
    },
    {
      id: "item-7",
      question: "How secure is my data?",
      answer: "RezGuru AI uses enterprise-grade encryption for all data. Our self-hosted architecture means your sensitive lead information stays within your control. We employ industry-standard security practices and regular security audits to ensure your data remains protected."
    }
  ];
  
  // Filter FAQs based on search query
  const filteredFaqs = searchQuery === "" 
    ? faqItems 
    : faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
        <p className="mt-1 text-gray-500">Find answers to common questions and learn how to use RezGuru AI</p>
      </div>
      
      <div className="relative mb-8 max-w-2xl">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <i className="fas fa-search text-gray-400"></i>
        </div>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 py-3 bg-white border-gray-300"
          placeholder="Search for help topics..."
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  No results found for "{searchQuery}". Try a different search term.
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-left font-medium">{item.question}</AccordionTrigger>
                      <AccordionContent className="text-gray-600">{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Quick Start Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    1
                  </div>
                  <p>Set up your first data scraping job to gather leads</p>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    2
                  </div>
                  <p>Create an automation workflow to score and contact leads</p>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    3
                  </div>
                  <p>Set up document templates for offers and contracts</p>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    4
                  </div>
                  <p>Monitor your lead pipeline on the dashboard</p>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-book mr-2"></i> View Full Guide
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Video Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <i className="fas fa-play-circle text-5xl text-gray-400"></i>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900">Getting Started with RezGuru</h3>
                    <p className="text-sm text-gray-500 mt-1">5:32 • Overview of features</p>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <i className="fas fa-play-circle text-5xl text-gray-400"></i>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900">Creating Automation Workflows</h3>
                    <p className="text-sm text-gray-500 mt-1">8:14 • Step-by-step tutorial</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-video mr-2"></i> View All Tutorials
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-4">
                <p>Our support team is ready to assist you with any questions or issues.</p>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="fas fa-envelope text-primary-600 w-5 mr-2"></i>
                    <a href="mailto:support@rezguru.ai" className="text-primary-600 hover:text-primary-800">
                      support@rezguru.ai
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fas fa-comments text-primary-600 w-5 mr-2"></i>
                    <a href="#" className="text-primary-600 hover:text-primary-800">
                      Live Chat (9am-5pm EST)
                    </a>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button className="w-full bg-primary-600 hover:bg-primary-700">
                    <i className="fas fa-headset mr-2"></i> Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
