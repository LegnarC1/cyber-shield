import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const threats = pgTable("threats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "malware", "network", "phishing", etc.
  severity: text("severity").notNull(), // "critical", "high", "medium", "low"
  status: text("status").notNull(), // "active", "resolved", "investigating"
  location: text("location").notNull(),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const scannedFiles = pgTable("scanned_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  scanStatus: text("scan_status").notNull(), // "clean", "infected", "scanning", "error"
  threatFound: text("threat_found"),
  scannedAt: timestamp("scanned_at").notNull().defaultNow(),
});

export const systemEvents = pgTable("system_events", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const securityConfig = pgTable("security_config", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(), // "firewall", "antivirus", "updates", "access"
  status: text("status").notNull(), // "active", "inactive", "error"
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertThreatSchema = createInsertSchema(threats).omit({
  id: true,
  detectedAt: true,
});

export const insertScannedFileSchema = createInsertSchema(scannedFiles).omit({
  id: true,
  scannedAt: true,
});

export const insertSystemEventSchema = createInsertSchema(systemEvents).omit({
  id: true,
  timestamp: true,
});

export const insertSecurityConfigSchema = createInsertSchema(securityConfig).omit({
  id: true,
  lastUpdated: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Threat = typeof threats.$inferSelect;
export type InsertThreat = z.infer<typeof insertThreatSchema>;
export type ScannedFile = typeof scannedFiles.$inferSelect;
export type InsertScannedFile = z.infer<typeof insertScannedFileSchema>;
export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = z.infer<typeof insertSystemEventSchema>;
export type SecurityConfig = typeof securityConfig.$inferSelect;
export type InsertSecurityConfig = z.infer<typeof insertSecurityConfigSchema>;
