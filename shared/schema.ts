import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  lastKnownIp: text("last_known_ip"),
  isLocked: boolean("is_locked").default(false),
  failedAttempts: integer("failed_attempts").default(0),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  ipAddress: text("ip_address").notNull(),
  success: boolean("success").notNull(),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});

export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  type: text("type").notNull(), // "ip_verification", "password_reset"
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const connectedDevices = pgTable("connected_devices", {
  id: serial("id").primaryKey(),
  deviceName: text("device_name").notNull(),
  ownerName: text("owner_name").notNull(),
  deviceType: text("device_type").notNull(), // "desktop", "laptop", "server", "mobile"
  ipAddress: text("ip_address").notNull(),
  macAddress: text("mac_address"),
  operatingSystem: text("operating_system"),
  status: text("status").notNull().default("active"), // "active", "inactive", "quarantined"
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
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
  email: true,
  password: true,
});

export const insertLoginAttemptSchema = createInsertSchema(loginAttempts).omit({
  id: true,
  attemptedAt: true,
});

export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).omit({
  id: true,
  createdAt: true,
  used: true,
});

export const insertConnectedDeviceSchema = createInsertSchema(connectedDevices).omit({
  id: true,
  lastSeen: true,
  connectedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = z.infer<typeof insertLoginAttemptSchema>;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;
export type ConnectedDevice = typeof connectedDevices.$inferSelect;
export type InsertConnectedDevice = z.infer<typeof insertConnectedDeviceSchema>;
export type Threat = typeof threats.$inferSelect;
export type InsertThreat = z.infer<typeof insertThreatSchema>;
export type ScannedFile = typeof scannedFiles.$inferSelect;
export type InsertScannedFile = z.infer<typeof insertScannedFileSchema>;
export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = z.infer<typeof insertSystemEventSchema>;
export type SecurityConfig = typeof securityConfig.$inferSelect;
export type InsertSecurityConfig = z.infer<typeof insertSecurityConfigSchema>;
