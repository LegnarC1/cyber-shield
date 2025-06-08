import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertThreatSchema, insertScannedFileSchema, insertSystemEventSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Threats
  app.get("/api/threats", async (req, res) => {
    try {
      const threats = await storage.getThreats();
      res.json(threats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threats" });
    }
  });

  app.post("/api/threats", async (req, res) => {
    try {
      const validatedData = insertThreatSchema.parse(req.body);
      const threat = await storage.createThreat(validatedData);
      res.status(201).json(threat);
    } catch (error) {
      res.status(400).json({ message: "Invalid threat data" });
    }
  });

  app.patch("/api/threats/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, resolvedAt } = req.body;
      const threat = await storage.updateThreatStatus(id, status, resolvedAt);
      if (!threat) {
        return res.status(404).json({ message: "Threat not found" });
      }
      res.json(threat);
    } catch (error) {
      res.status(400).json({ message: "Failed to update threat" });
    }
  });

  // Scanned Files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getScannedFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scanned files" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const validatedData = insertScannedFileSchema.parse(req.body);
      const file = await storage.createScannedFile(validatedData);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ message: "Invalid file data" });
    }
  });

  app.patch("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { scanStatus, threatFound } = req.body;
      const file = await storage.updateFileStatus(id, scanStatus, threatFound);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(400).json({ message: "Failed to update file status" });
    }
  });

  // System Events
  app.get("/api/events", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const events = await storage.getSystemEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertSystemEventSchema.parse(req.body);
      const event = await storage.createSystemEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  // Security Configuration
  app.get("/api/security-config", async (req, res) => {
    try {
      const config = await storage.getSecurityConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security configuration" });
    }
  });

  app.patch("/api/security-config/:service", async (req, res) => {
    try {
      const service = req.params.service;
      const { status } = req.body;
      const config = await storage.updateSecurityConfig(service, status);
      if (!config) {
        return res.status(404).json({ message: "Security configuration not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(400).json({ message: "Failed to update security configuration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
