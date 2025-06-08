import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertThreatSchema, insertScannedFileSchema, insertSystemEventSchema, insertConnectedDeviceSchema } from "@shared/schema";

// Initialize database with sample data
async function initializeDatabase() {
  try {
    // Add sample threats if none exist
    const existingThreats = await storage.getThreats();
    if (existingThreats.length === 0) {
      const sampleThreats = [
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

      for (const threat of sampleThreats) {
        await storage.createThreat(threat);
      }
    }

    // Add sample files if none exist
    const existingFiles = await storage.getScannedFiles();
    if (existingFiles.length === 0) {
      const sampleFiles = [
        { filename: "document.pdf", fileSize: 2457600, scanStatus: "clean" },
        { filename: "archive.zip", fileSize: 16777216, scanStatus: "scanning" },
        { filename: "script.exe", fileSize: 5242880, scanStatus: "infected" }
      ];

      for (const file of sampleFiles) {
        await storage.createScannedFile(file);
      }
    }

    // Add sample events if none exist
    const existingEvents = await storage.getSystemEvents(5);
    if (existingEvents.length === 0) {
      const sampleEvents = [
        { type: "security", message: "Intento de acceso no autorizado", severity: "high" },
        { type: "firewall", message: "Firewall bloqueó conexión", severity: "medium" },
        { type: "update", message: "Actualización de seguridad aplicada", severity: "low" },
        { type: "threat", message: "Malware detectado y eliminado", severity: "high" },
        { type: "scan", message: "Escaneo programado completado", severity: "low" }
      ];

      for (const event of sampleEvents) {
        await storage.createSystemEvent(event);
      }
    }

    // Add sample connected devices if none exist
    const existingDevices = await storage.getConnectedDevices();
    if (existingDevices.length === 0) {
      const sampleDevices = [
        {
          deviceName: "Servidor Principal",
          deviceType: "server",
          ipAddress: "192.168.1.10",
          macAddress: "00:11:22:33:44:55",
          status: "active",
          ownerName: "Administrador del Sistema",
          operatingSystem: "Ubuntu Server 22.04"
        },
        {
          deviceName: "Workstation-001",
          deviceType: "desktop",
          ipAddress: "192.168.1.25",
          macAddress: "00:11:22:33:44:66",
          status: "active",
          ownerName: "Juan Pérez",
          operatingSystem: "Windows 11 Pro"
        },
        {
          deviceName: "Laptop-HR-002",
          deviceType: "laptop",
          ipAddress: "192.168.1.45",
          macAddress: "00:11:22:33:44:77",
          status: "inactive",
          ownerName: "María García",
          operatingSystem: "macOS Monterey"
        }
      ];

      for (const device of sampleDevices) {
        await storage.createConnectedDevice(device);
      }
    }

    console.log("Database initialized with sample data");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to protect routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Initialize database with sample data
  await initializeDatabase();

  // Connected Devices endpoints
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getConnectedDevices();
      res.json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.post("/api/devices", requireAuth, async (req, res) => {
    try {
      const result = insertConnectedDeviceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid device data" });
      }
      
      const device = await storage.createConnectedDevice(result.data);
      res.status(201).json(device);
    } catch (error) {
      console.error("Error creating device:", error);
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.patch("/api/devices/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const device = await storage.updateDeviceStatus(parseInt(id), status);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      res.json(device);
    } catch (error) {
      console.error("Error updating device:", error);
      res.status(500).json({ message: "Failed to update device" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Security configuration endpoints
  app.get("/api/security-config", async (req, res) => {
    try {
      const config = await storage.getSecurityConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching security config:", error);
      res.status(500).json({ message: "Failed to fetch security config" });
    }
  });

  app.patch("/api/security-config/:service", requireAuth, async (req, res) => {
    try {
      const { service } = req.params;
      const { status } = req.body;
      
      const config = await storage.updateSecurityConfig(service, status);
      if (!config) {
        return res.status(404).json({ message: "Security service not found" });
      }
      
      res.json(config);
    } catch (error) {
      console.error("Error updating security config:", error);
      res.status(500).json({ message: "Failed to update security config" });
    }
  });

  // Threats endpoints
  app.get("/api/threats", async (req, res) => {
    try {
      const threats = await storage.getThreats();
      res.json(threats);
    } catch (error) {
      console.error("Error fetching threats:", error);
      res.status(500).json({ message: "Failed to fetch threats" });
    }
  });

  app.get("/api/threats/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const threat = await storage.getThreat(parseInt(id));
      
      if (!threat) {
        return res.status(404).json({ message: "Threat not found" });
      }
      
      res.json(threat);
    } catch (error) {
      console.error("Error fetching threat:", error);
      res.status(500).json({ message: "Failed to fetch threat" });
    }
  });

  app.post("/api/threats", requireAuth, async (req, res) => {
    try {
      const result = insertThreatSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid threat data" });
      }
      
      const threat = await storage.createThreat(result.data);
      res.status(201).json(threat);
    } catch (error) {
      console.error("Error creating threat:", error);
      res.status(500).json({ message: "Failed to create threat" });
    }
  });

  app.patch("/api/threats/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const resolvedAt = status === "resolved" ? new Date() : undefined;
      
      const threat = await storage.updateThreatStatus(parseInt(id), status, resolvedAt);
      if (!threat) {
        return res.status(404).json({ message: "Threat not found" });
      }
      
      res.json(threat);
    } catch (error) {
      console.error("Error updating threat:", error);
      res.status(500).json({ message: "Failed to update threat" });
    }
  });

  // Scanned files endpoints
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getScannedFiles();
      res.json(files);
    } catch (error) {
      console.error("Error fetching scanned files:", error);
      res.status(500).json({ message: "Failed to fetch scanned files" });
    }
  });

  app.post("/api/files", requireAuth, async (req, res) => {
    try {
      const result = insertScannedFileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid file data" });
      }
      
      const file = await storage.createScannedFile(result.data);
      res.status(201).json(file);
    } catch (error) {
      console.error("Error creating scanned file:", error);
      res.status(500).json({ message: "Failed to create scanned file" });
    }
  });

  app.patch("/api/files/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, threatFound } = req.body;
      
      const file = await storage.updateFileStatus(parseInt(id), status, threatFound);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  // System events endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const events = await storage.getSystemEvents(limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching system events:", error);
      res.status(500).json({ message: "Failed to fetch system events" });
    }
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const result = insertSystemEventSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid event data" });
      }
      
      const event = await storage.createSystemEvent(result.data);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating system event:", error);
      res.status(500).json({ message: "Failed to create system event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}