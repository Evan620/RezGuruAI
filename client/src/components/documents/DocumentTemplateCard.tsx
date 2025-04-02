import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DocumentTemplate } from '@/lib/types';
import { FileText } from "lucide-react";

interface DocumentTemplateCardProps {
  template: DocumentTemplate;
  onSelect: (templateId: string) => void;
}

export default function DocumentTemplateCard({ template, onSelect }: DocumentTemplateCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={() => onSelect(template.id)}
    >
      <CardContent className="pt-6 pb-4">
        <div className="flex items-center">
          <div className={`rounded-md ${template.iconBgColor || 'bg-blue-100'} p-3 ${template.iconColor || 'text-blue-600'} flex-shrink-0 mr-3`}>
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-500">{template.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}