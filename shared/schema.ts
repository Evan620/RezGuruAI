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

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type ScrapingJob = typeof scrapingJobs.$inferSelect;
export type InsertScrapingJob = z.infer<typeof insertScrapingJobSchema>;
