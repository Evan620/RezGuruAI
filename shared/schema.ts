import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  plan: text("plan").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  plan: true,
});

// Lead schema
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  phone: text("phone"),
  email: text("email"),
  source: text("source").notNull(), // tax_delinquent, probate, fsbo
  motivationScore: integer("motivation_score"), // 0-100
  status: text("status").default("new"), // new, contacted, closed
  notes: text("notes"),
  amountOwed: text("amount_owed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Workflow schema
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  trigger: text("trigger").notNull(), // new_lead, lead_update, scheduled
  actions: json("actions").notNull(), // array of actions
  active: boolean("active").default(true),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  lastRun: true,
  createdAt: true,
});

// Document schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // contract, dispute_letter, offer
  content: text("content"),
  url: text("url"),
  status: text("status").default("draft"), // draft, sent, signed, rejected
  createdAt: timestamp("created_at").defaultNow(),
  leadId: integer("lead_id").references(() => leads.id),
  userId: integer("user_id").references(() => users.id),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

// ScrapingJob schema
export const scrapingJobs = pgTable("scraping_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  source: text("source").notNull(), // tax_delinquent, probate, fsbo
  url: text("url"),
  status: text("status").default("pending"), // pending, running, completed, failed
  results: json("results"), // array of results
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertScrapingJobSchema = createInsertSchema(scrapingJobs).omit({
  id: true,
  results: true,
  lastRun: true,
  createdAt: true,
});

// Define relations between tables
export const relations = {
  users: {
    leads: {
      relationName: "user_leads",
      foreignKey: leads.userId,
      references: () => users.id,
    },
    workflows: {
      relationName: "user_workflows",
      foreignKey: workflows.userId,
      references: () => users.id,
    },
    documents: {
      relationName: "user_documents",
      foreignKey: documents.userId,
      references: () => users.id,
    },
    scrapingJobs: {
      relationName: "user_scraping_jobs",
      foreignKey: scrapingJobs.userId,
      references: () => users.id,
    }
  },
  leads: {
    documents: {
      relationName: "lead_documents",
      foreignKey: documents.leadId,
      references: () => leads.id,
    }
  }
};

// Enhance insert schemas to ensure required fields
export const enhancedInsertUserSchema = insertUserSchema.extend({
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().nullable().optional(),
  plan: z.string().default("free")
});

export const enhancedInsertLeadSchema = insertLeadSchema.extend({
  name: z.string().min(1),
  source: z.string().min(1),
  status: z.string().default("new"),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  userId: z.number()
});

export const enhancedInsertWorkflowSchema = insertWorkflowSchema.extend({
  name: z.string().min(1),
  trigger: z.string().min(1),
  actions: z.array(z.any()),
  description: z.string().nullable().optional(),
  active: z.boolean().default(true),
  userId: z.number()
});

export const enhancedInsertDocumentSchema = insertDocumentSchema.extend({
  name: z.string().min(1),
  type: z.string().min(1),
  status: z.string().default("draft"),
  content: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  leadId: z.number().nullable().optional(),
  userId: z.number()
});

export const enhancedInsertScrapingJobSchema = insertScrapingJobSchema.extend({
  name: z.string().min(1),
  source: z.string().min(1),
  status: z.string().default("pending"),
  url: z.string().nullable().optional(),
  userId: z.number()
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof enhancedInsertUserSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof enhancedInsertLeadSchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof enhancedInsertWorkflowSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof enhancedInsertDocumentSchema>;

export type ScrapingJob = typeof scrapingJobs.$inferSelect;
export type InsertScrapingJob = z.infer<typeof enhancedInsertScrapingJobSchema>;
