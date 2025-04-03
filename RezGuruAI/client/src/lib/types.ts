// Shared types for frontend
import React from 'react';
export interface Lead {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  source: string;
  motivationScore?: number;
  status: string;
  notes?: string;
  amountOwed?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  trigger: string;
  actions: WorkflowAction[];
  active: boolean;
  lastRun?: Date;
  createdAt: Date;
  userId: number;
}

export interface WorkflowAction {
  type: string;
  config: Record<string, any>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export interface Document {
  id: number;
  name: string;
  type: string;
  content?: string;
  url?: string;
  status: string;
  createdAt: Date;
  leadId?: number;
  userId: number;
}

export interface ScrapingJob {
  id: number;
  name: string;
  source: string;
  url?: string;
  status: string;
  notes?: string;
  schedule?: string;
  results?: any[];
  lastRun?: Date;
  createdAt: Date;
  userId: number;
}

export interface User {
  id: number;
  username: string;
  fullName?: string;
  plan: string;
}

export interface Metric {
  id: string;
  title: string;
  value: number;
  change: number;
  isPositiveChange: boolean;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  template?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export interface DocumentGenerationParams {
  templateId: string;
  leadId?: number;
  customFields?: Record<string, string>;
}
