import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentTemplate, Lead, DocumentGenerationParams } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import DocumentTemplateCard from './DocumentTemplateCard';

interface DocumentGeneratorProps {
  onClose?: () => void;
}

export default function DocumentGenerator({ onClose }: DocumentGeneratorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch document templates
  const {
    data: templates,
    isLoading: templatesLoading,
    error: templatesError
  } = useQuery({
    queryKey: ['/api/document-templates'],
    enabled: currentStep === 1,
  });

  // Fetch leads
  const {
    data: leads,
    isLoading: leadsLoading,
    error: leadsError
  } = useQuery({
    queryKey: ['/api/leads'],
    enabled: currentStep === 2,
  });

  // Fetch selected template details
  const {
    data: selectedTemplate,
    isLoading: templateLoading,
    error: templateError
  } = useQuery({
    queryKey: ['/api/document-templates', selectedTemplateId],
    enabled: !!selectedTemplateId,
  });

  // Generate document mutation
  const generateDocument = useMutation({
    mutationFn: async (params: DocumentGenerationParams) => {
      setIsGenerating(true);
      return apiRequest('/api/documents/generate', 'POST', params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: 'Success!',
        description: 'Document generated successfully.',
        variant: 'default',
      });
      setIsGenerating(false);
      if (onClose) onClose();
    },
    onError: (error) => {
      console.error('Error generating document:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate document. Please try again.',
        variant: 'destructive',
      });
      setIsGenerating(false);
    },
  });

  // Get placeholder field names from the template content
  const getFieldsFromTemplate = (template: DocumentTemplate): string[] => {
    if (!template || !template.template) return [];
    
    const placeholderRegex = /{{(.*?)}}/g;
    const matches = template.template.match(placeholderRegex) || [];
    
    return matches
      .map(match => match.replace('{{', '').replace('}}', ''))
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
  };

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setCurrentStep(2);
  };

  // Handle lead selection
  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId ? parseInt(leadId) : null);
    setCurrentStep(3);
  };

  // Handle custom field changes
  const handleCustomFieldChange = (field: string, value: string) => {
    setCustomFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle document generation
  const handleGenerateDocument = () => {
    if (!selectedTemplateId) {
      toast({
        title: 'Error',
        description: 'Please select a template first.',
        variant: 'destructive',
      });
      return;
    }

    const params: DocumentGenerationParams = {
      templateId: selectedTemplateId,
      customFields: customFields,
    };

    if (selectedLeadId) {
      params.leadId = selectedLeadId;
    }

    generateDocument.mutate(params);
  };

  // Handle going back to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step 1: Choose template
  const renderSelectTemplate = () => {
    if (templatesLoading) {
      return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    if (templatesError) {
      return <div className="text-center py-8 text-destructive">Error loading templates</div>;
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.map((template: DocumentTemplate) => (
            <DocumentTemplateCard
              key={template.id}
              template={{
                ...template,
                iconBgColor: template.iconBgColor || "bg-blue-100",
                iconColor: template.iconColor || "text-blue-600"
              }}
              onSelect={handleSelectTemplate}
            />
          ))}
        </div>
      </div>
    );
  };

  // Render step 2: Choose lead
  const renderSelectLead = () => {
    if (leadsLoading) {
      return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    if (leadsError) {
      return <div className="text-center py-8 text-destructive">Error loading leads</div>;
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="lead">Select Lead (Optional)</Label>
          <Select onValueChange={handleSelectLead}>
            <SelectTrigger>
              <SelectValue placeholder="Select a lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No lead (blank document)</SelectItem>
              {leads?.map((lead: Lead) => (
                <SelectItem key={lead.id} value={lead.id.toString()}>
                  {lead.name} {lead.address ? `- ${lead.address}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Selecting a lead will pre-fill some fields in the document with lead information.
          </p>
        </div>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>Back</Button>
          <Button onClick={() => setCurrentStep(3)}>Continue</Button>
        </div>
      </div>
    );
  };

  // Render step 3: Fill custom fields
  const renderCustomFields = () => {
    if (templateLoading) {
      return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    if (templateError || !selectedTemplate) {
      return <div className="text-center py-8 text-destructive">Error loading template details</div>;
    }

    const templateFields = getFieldsFromTemplate(selectedTemplate);
    
    // Fixed fields that are pre-filled by the system
    const systemFields = [
      'currentDate', 
      'sellerName',
      'propertyAddress', 
      'recipientName', 
      'recipientAddress', 
      'recipientCity', 
      'recipientState', 
      'recipientZip', 
      'ownerName'
    ];
    
    const customFields = templateFields.filter(field => !systemFields.includes(field));

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Document Information</CardTitle>
            <CardDescription>
              Fill in the details for your {selectedTemplate.name.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customFields.map(field => {
                // Convert camelCase to Title Case for labels
                const label = field
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                
                // Use textarea for fields that likely contain long text  
                const isTextArea = [
                  'description', 'notes', 'provisions', 'analysis', 
                  'recommendations', 'conclusion', 'comparableSales'
                ].some(term => field.toLowerCase().includes(term.toLowerCase()));
                
                return (
                  <div key={field} className="grid gap-2">
                    <Label htmlFor={field}>{label}</Label>
                    {isTextArea ? (
                      <Textarea
                        id={field}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        value={customFields[field] || ''}
                        onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={field}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        value={customFields[field] || ''}
                        onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>Back</Button>
          <Button 
            onClick={handleGenerateDocument} 
            disabled={isGenerating || generateDocument.isPending}
          >
            {isGenerating || generateDocument.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Document
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Render based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderSelectTemplate();
      case 2:
        return renderSelectLead();
      case 3:
        return renderCustomFields();
      default:
        return renderSelectTemplate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Generate Document</h2>
        <p className="text-muted-foreground">
          Create professional real estate documents with just a few clicks
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'border border-input'}`}>
          {currentStep > 1 ? <Check className="h-4 w-4" /> : 1}
        </div>
        <Separator className="flex-1" />
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'border border-input'}`}>
          {currentStep > 2 ? <Check className="h-4 w-4" /> : 2}
        </div>
        <Separator className="flex-1" />
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'border border-input'}`}>
          3
        </div>
      </div>
      {renderStep()}
    </div>
  );
}