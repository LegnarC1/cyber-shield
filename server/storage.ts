import { 
  users, threats, scannedFiles, systemEvents, securityConfig,
  type User, type InsertUser, type Threat, type InsertThreat,
  type ScannedFile, type InsertScannedFile, type SystemEvent, type InsertSystemEvent,
  type SecurityConfig, type InsertSecurityConfig
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private threats: Map<number, Threat>;
  private scannedFiles: Map<number, ScannedFile>;
  private systemEvents: Map<number, SystemEvent>;
  private securityConfig: Map<string, SecurityConfig>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.threats = new Map();
    this.scannedFiles = new Map();
    this.systemEvents = new Map();
    this.securityConfig = new Map();
    this.currentId = 1;
    
    // Initialize with some sample configuration
    this.initializeData();
  }

  private initializeData() {
    // Initialize security configuration
    const configs = [
      { service: "firewall", status: "active" },
      { service: "antivirus", status: "active" },
      { service: "updates", status: "scheduled" },
      { service: "access", status: "restricted" }
    ];
    
    configs.forEach(config => {
      const securityConfig: SecurityConfig = {
        id: this.currentId++,
        service: config.service,
        status: config.status,
        lastUpdated: new Date()
      };
      this.securityConfig.set(config.service, securityConfig);
    });

    // Add some initial threats for demo
    const initialThreats = [
      {
        name: "Malware Trojan.Win32.Agent",
        type: "malware",
        severity: "critical",
        status: "active",
        location: "/home/user/downloads/suspicious.exe"
      },
      {
        name: "Actividad de Red Sospechosa",
        type: "network",
        severity: "medium",
        status: "investigating",
        location: "IP: 192.168.1.105"
      },
      {
        name: "Amenaza Neutralizada",
        type: "malware",
        severity: "high",
        status: "resolved",
        location: "Archivo eliminado exitosamente"
      }
    ];

    initialThreats.forEach(threat => {
      const threatObj: Threat = {
        id: this.currentId++,
        ...threat,
        detectedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60),
        resolvedAt: threat.status === "resolved" ? new Date() : null
      };
      this.threats.set(threatObj.id, threatObj);
    });

    // Add some initial scanned files
    const initialFiles = [
      { filename: "document.pdf", fileSize: 2457600, scanStatus: "clean" },
      { filename: "archive.zip", fileSize: 16777216, scanStatus: "scanning" },
      { filename: "script.exe", fileSize: 5242880, scanStatus: "infected", threatFound: "Trojan.Generic" }
    ];

    initialFiles.forEach(file => {
      const fileObj: ScannedFile = {
        id: this.currentId++,
        ...file,
        scannedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60),
        threatFound: file.threatFound || null
      };
      this.scannedFiles.set(fileObj.id, fileObj);
    });

    // Add some initial system events
    const initialEvents = [
      { type: "security", message: "Intento de acceso no autorizado", severity: "high" },
      { type: "firewall", message: "Firewall bloqueó conexión", severity: "medium" },
      { type: "update", message: "Actualización de seguridad aplicada", severity: "low" },
      { type: "threat", message: "Malware detectado y eliminado", severity: "high" },
      { type: "scan", message: "Escaneo programado completado", severity: "low" }
    ];

    initialEvents.forEach(event => {
      const eventObj: SystemEvent = {
        id: this.currentId++,
        ...event,
        timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60)
      };
      this.systemEvents.set(eventObj.id, eventObj);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getThreats(): Promise<Threat[]> {
    return Array.from(this.threats.values()).sort((a, b) => 
      new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    );
  }

  async getThreat(id: number): Promise<Threat | undefined> {
    return this.threats.get(id);
  }

  async createThreat(insertThreat: InsertThreat): Promise<Threat> {
    const id = this.currentId++;
    const threat: Threat = {
      ...insertThreat,
      id,
      detectedAt: new Date(),
      resolvedAt: null
    };
    this.threats.set(id, threat);
    return threat;
  }

  async updateThreatStatus(id: number, status: string, resolvedAt?: Date): Promise<Threat | undefined> {
    const threat = this.threats.get(id);
    if (threat) {
      threat.status = status;
      if (resolvedAt) {
        threat.resolvedAt = resolvedAt;
      }
      this.threats.set(id, threat);
    }
    return threat;
  }

  async getScannedFiles(): Promise<ScannedFile[]> {
    return Array.from(this.scannedFiles.values()).sort((a, b) => 
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
  }

  async createScannedFile(insertFile: InsertScannedFile): Promise<ScannedFile> {
    const id = this.currentId++;
    const file: ScannedFile = {
      ...insertFile,
      id,
      scannedAt: new Date(),
      threatFound: null
    };
    this.scannedFiles.set(id, file);
    return file;
  }

  async updateFileStatus(id: number, status: string, threatFound?: string): Promise<ScannedFile | undefined> {
    const file = this.scannedFiles.get(id);
    if (file) {
      file.scanStatus = status;
      if (threatFound) {
        file.threatFound = threatFound;
      }
      this.scannedFiles.set(id, file);
    }
    return file;
  }

  async getSystemEvents(limit: number = 50): Promise<SystemEvent[]> {
    return Array.from(this.systemEvents.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createSystemEvent(insertEvent: InsertSystemEvent): Promise<SystemEvent> {
    const id = this.currentId++;
    const event: SystemEvent = {
      ...insertEvent,
      id,
      timestamp: new Date()
    };
    this.systemEvents.set(id, event);
    return event;
  }

  async getSecurityConfig(): Promise<SecurityConfig[]> {
    return Array.from(this.securityConfig.values());
  }

  async updateSecurityConfig(service: string, status: string): Promise<SecurityConfig | undefined> {
    const config = this.securityConfig.get(service);
    if (config) {
      config.status = status;
      config.lastUpdated = new Date();
      this.securityConfig.set(service, config);
    }
    return config;
  }

  async getDashboardStats(): Promise<{
    protectedSystems: number;
    threatsDetected: number;
    scansCompleted: number;
    securityLevel: number;
  }> {
    const activeThreats = Array.from(this.threats.values()).filter(t => t.status === "active").length;
    const totalScans = this.scannedFiles.size;
    
    return {
      protectedSystems: 247,
      threatsDetected: activeThreats,
      scansCompleted: totalScans,
      securityLevel: Math.max(70, 100 - (activeThreats * 5))
    };
  }
}

export const storage = new MemStorage();
