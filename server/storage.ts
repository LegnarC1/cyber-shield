import { 
  users, threats, scannedFiles, systemEvents, securityConfig, loginAttempts, verificationCodes, connectedDevices,
  type User, type InsertUser, type Threat, type InsertThreat,
  type ScannedFile, type InsertScannedFile, type SystemEvent, type InsertSystemEvent,
  type SecurityConfig, type InsertSecurityConfig, type LoginAttempt, type InsertLoginAttempt,
  type VerificationCode, type InsertVerificationCode, type ConnectedDevice, type InsertConnectedDevice
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  sessionStore: session.Store;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLogin(id: number, ipAddress: string): Promise<User | undefined>;
  lockUser(id: number): Promise<void>;
  unlockUser(id: number): Promise<void>;
  incrementFailedAttempts(id: number): Promise<void>;
  resetFailedAttempts(id: number): Promise<void>;
  updatePassword(id: number, newPassword: string): Promise<void>;
  
  // Login Attempts
  createLoginAttempt(attempt: InsertLoginAttempt): Promise<LoginAttempt>;
  getRecentLoginAttempts(email: string, minutes: number): Promise<LoginAttempt[]>;
  
  // Verification Codes
  createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode>;
  getValidVerificationCode(email: string, code: string, type: string): Promise<VerificationCode | undefined>;
  markCodeAsUsed(id: number): Promise<void>;
  
  // Connected Devices
  getConnectedDevices(): Promise<ConnectedDevice[]>;
  createConnectedDevice(device: InsertConnectedDevice): Promise<ConnectedDevice>;
  updateDeviceLastSeen(id: number): Promise<void>;
  updateDeviceStatus(id: number, status: string): Promise<ConnectedDevice | undefined>;
  
  // Threats
  getThreats(): Promise<Threat[]>;
  getThreat(id: number): Promise<Threat | undefined>;
  createThreat(threat: InsertThreat): Promise<Threat>;
  updateThreatStatus(id: number, status: string, resolvedAt?: Date): Promise<Threat | undefined>;
  
  // Scanned Files
  getScannedFiles(): Promise<ScannedFile[]>;
  createScannedFile(file: InsertScannedFile): Promise<ScannedFile>;
  updateFileStatus(id: number, status: string, threatFound?: string): Promise<ScannedFile | undefined>;
  
  // System Events
  getSystemEvents(limit?: number): Promise<SystemEvent[]>;
  createSystemEvent(event: InsertSystemEvent): Promise<SystemEvent>;
  
  // Security Config
  getSecurityConfig(): Promise<SecurityConfig[]>;
  updateSecurityConfig(service: string, status: string): Promise<SecurityConfig | undefined>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<{
    protectedSystems: number;
    threatsDetected: number;
    scansCompleted: number;
    securityLevel: number;
  }>;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isLocked: false,
        failedAttempts: 0,
        createdAt: new Date()
      })
      .returning();
    return user;
  }

  async updateUserLogin(id: number, ipAddress: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        lastKnownIp: ipAddress,
        lastLoginAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async lockUser(id: number): Promise<void> {
    await db
      .update(users)
      .set({ isLocked: true })
      .where(eq(users.id, id));
  }

  async unlockUser(id: number): Promise<void> {
    await db
      .update(users)
      .set({ isLocked: false, failedAttempts: 0 })
      .where(eq(users.id, id));
  }

  async incrementFailedAttempts(id: number): Promise<void> {
    await db
      .update(users)
      .set({ failedAttempts: sql`${users.failedAttempts} + 1` })
      .where(eq(users.id, id));
  }

  async resetFailedAttempts(id: number): Promise<void> {
    await db
      .update(users)
      .set({ failedAttempts: 0 })
      .where(eq(users.id, id));
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id));
  }

  // Login Attempts
  async createLoginAttempt(attempt: InsertLoginAttempt): Promise<LoginAttempt> {
    const [loginAttempt] = await db
      .insert(loginAttempts)
      .values(attempt)
      .returning();
    return loginAttempt;
  }

  async getRecentLoginAttempts(email: string, minutes: number): Promise<LoginAttempt[]> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return await db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.email, email),
          gte(loginAttempts.attemptedAt, cutoffTime)
        )
      )
      .orderBy(desc(loginAttempts.attemptedAt));
  }

  // Verification Codes
  async createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode> {
    const [verificationCode] = await db
      .insert(verificationCodes)
      .values({
        ...code,
        createdAt: new Date(),
        used: false
      })
      .returning();
    return verificationCode;
  }

  async getValidVerificationCode(email: string, code: string, type: string): Promise<VerificationCode | undefined> {
    const [verificationCode] = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, code),
          eq(verificationCodes.type, type),
          eq(verificationCodes.used, false),
          gte(verificationCodes.expiresAt, new Date())
        )
      );
    return verificationCode || undefined;
  }

  async markCodeAsUsed(id: number): Promise<void> {
    await db
      .update(verificationCodes)
      .set({ used: true })
      .where(eq(verificationCodes.id, id));
  }

  // Connected Devices
  async getConnectedDevices(): Promise<ConnectedDevice[]> {
    return await db
      .select()
      .from(connectedDevices)
      .orderBy(desc(connectedDevices.lastSeen));
  }

  async createConnectedDevice(device: InsertConnectedDevice): Promise<ConnectedDevice> {
    const [connectedDevice] = await db
      .insert(connectedDevices)
      .values({
        ...device,
        lastSeen: new Date(),
        connectedAt: new Date()
      })
      .returning();
    return connectedDevice;
  }

  async updateDeviceLastSeen(id: number): Promise<void> {
    await db
      .update(connectedDevices)
      .set({ lastSeen: new Date() })
      .where(eq(connectedDevices.id, id));
  }

  async updateDeviceStatus(id: number, status: string): Promise<ConnectedDevice | undefined> {
    const [device] = await db
      .update(connectedDevices)
      .set({ status })
      .where(eq(connectedDevices.id, id))
      .returning();
    return device || undefined;
  }

  // Threats
  async getThreats(): Promise<Threat[]> {
    return await db
      .select()
      .from(threats)
      .orderBy(desc(threats.detectedAt));
  }

  async getThreat(id: number): Promise<Threat | undefined> {
    const [threat] = await db.select().from(threats).where(eq(threats.id, id));
    return threat || undefined;
  }

  async createThreat(insertThreat: InsertThreat): Promise<Threat> {
    const [threat] = await db
      .insert(threats)
      .values({
        ...insertThreat,
        detectedAt: new Date(),
        resolvedAt: null
      })
      .returning();
    return threat;
  }

  async updateThreatStatus(id: number, status: string, resolvedAt?: Date): Promise<Threat | undefined> {
    const [threat] = await db
      .update(threats)
      .set({
        status,
        ...(resolvedAt && { resolvedAt })
      })
      .where(eq(threats.id, id))
      .returning();
    return threat || undefined;
  }

  // Scanned Files
  async getScannedFiles(): Promise<ScannedFile[]> {
    return await db
      .select()
      .from(scannedFiles)
      .orderBy(desc(scannedFiles.scannedAt));
  }

  async createScannedFile(insertFile: InsertScannedFile): Promise<ScannedFile> {
    const [file] = await db
      .insert(scannedFiles)
      .values({
        ...insertFile,
        scannedAt: new Date(),
        threatFound: null
      })
      .returning();
    return file;
  }

  async updateFileStatus(id: number, status: string, threatFound?: string): Promise<ScannedFile | undefined> {
    const [file] = await db
      .update(scannedFiles)
      .set({
        scanStatus: status,
        ...(threatFound && { threatFound })
      })
      .where(eq(scannedFiles.id, id))
      .returning();
    return file || undefined;
  }

  // System Events
  async getSystemEvents(limit: number = 50): Promise<SystemEvent[]> {
    return await db
      .select()
      .from(systemEvents)
      .orderBy(desc(systemEvents.timestamp))
      .limit(limit);
  }

  async createSystemEvent(insertEvent: InsertSystemEvent): Promise<SystemEvent> {
    const [event] = await db
      .insert(systemEvents)
      .values({
        ...insertEvent,
        timestamp: new Date()
      })
      .returning();
    return event;
  }

  // Security Config
  async getSecurityConfig(): Promise<SecurityConfig[]> {
    return await db.select().from(securityConfig);
  }

  async updateSecurityConfig(service: string, status: string): Promise<SecurityConfig | undefined> {
    const [config] = await db
      .update(securityConfig)
      .set({
        status,
        lastUpdated: new Date()
      })
      .where(eq(securityConfig.service, service))
      .returning();
    return config || undefined;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    protectedSystems: number;
    threatsDetected: number;
    scansCompleted: number;
    securityLevel: number;
  }> {
    const allThreats = await db.select().from(threats);
    const allFiles = await db.select().from(scannedFiles);
    const devices = await db.select().from(connectedDevices);
    
    const activeThreats = allThreats.filter(t => t.status === "active").length;
    const totalScans = allFiles.length;
    
    return {
      protectedSystems: devices.length || 247,
      threatsDetected: activeThreats,
      scansCompleted: totalScans,
      securityLevel: Math.max(70, 100 - (activeThreats * 5))
    };
  }
}

export const storage = new DatabaseStorage();