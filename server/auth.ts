import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            // Log failed attempt
            await storage.createLoginAttempt({
              email,
              ipAddress: "unknown",
              success: false
            });
            return done(null, false, { message: "Email o contraseña incorrectos" });
          }

          if (user.isLocked) {
            return done(null, false, { message: "Cuenta bloqueada. Contacte al administrador." });
          }

          const passwordMatch = await comparePasswords(password, user.password);
          
          if (!passwordMatch) {
            await storage.incrementFailedAttempts(user.id);
            await storage.createLoginAttempt({
              email,
              ipAddress: "unknown",
              success: false
            });

            // Lock account after 5 failed attempts
            if ((user.failedAttempts || 0) >= 4) {
              await storage.lockUser(user.id);
              return done(null, false, { message: "Cuenta bloqueada por múltiples intentos fallidos" });
            }

            return done(null, false, { message: "Email o contraseña incorrectos" });
          }

          // Reset failed attempts on successful login
          await storage.resetFailedAttempts(user.id);
          await storage.createLoginAttempt({
            email,
            ipAddress: "unknown",
            success: true
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
      }

      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      // Auto login after registration
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error en el registro" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res, next) => {
    const { email } = req.body;
    const userIP = req.ip || req.connection.remoteAddress || "unknown";

    // Check for too many recent attempts
    const recentAttempts = await storage.getRecentLoginAttempts(email, 15);
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    
    if (failedAttempts.length >= 5) {
      return res.status(429).json({ 
        message: "Demasiados intentos fallidos. Inténtelo más tarde." 
      });
    }

    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Credenciales inválidas" });
      }

      // Check IP verification if user has known IP
      if (user.lastKnownIp && user.lastKnownIp !== userIP) {
        // Generate verification code
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await storage.createVerificationCode({
          email: user.email,
          code,
          type: "ip_verification",
          expiresAt
        });

        // TODO: Send verification email
        console.log(`Verification code for ${user.email}: ${code}`);

        return res.status(200).json({
          requiresVerification: true,
          message: "Se ha detectado un acceso desde una nueva ubicación. Se ha enviado un código de verificación a su email."
        });
      }

      // Regular login
      req.login(user, async (err) => {
        if (err) return next(err);
        
        await storage.updateUserLogin(user.id, userIP);
        
        res.json({
          id: user.id,
          username: user.username,
          email: user.email
        });
      });
    })(req, res, next);
  });

  // IP Verification endpoint
  app.post("/api/verify-ip", async (req, res) => {
    try {
      const { email, code } = req.body;
      const userIP = req.ip || req.connection.remoteAddress || "unknown";

      const verificationCode = await storage.getValidVerificationCode(email, code, "ip_verification");
      
      if (!verificationCode) {
        return res.status(400).json({ message: "Código de verificación inválido o expirado" });
      }

      // Mark code as used
      await storage.markCodeAsUsed(verificationCode.id);

      // Get user and login
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      req.login(user, async (err) => {
        if (err) throw err;
        
        await storage.updateUserLogin(user.id, userIP);
        
        res.json({
          id: user.id,
          username: user.username,
          email: user.email
        });
      });
    } catch (error) {
      console.error("IP verification error:", error);
      res.status(500).json({ message: "Error en la verificación" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    });
  });

  // Password reset endpoint
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: "Si el email existe, se enviará un código de recuperación" });
      }

      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await storage.createVerificationCode({
        email,
        code,
        type: "password_reset",
        expiresAt
      });

      // TODO: Send reset email
      console.log(`Password reset code for ${email}: ${code}`);

      res.json({ message: "Si el email existe, se enviará un código de recuperación" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Error en el proceso de recuperación" });
    }
  });

  // Confirm password reset endpoint
  app.post("/api/confirm-reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;

      const verificationCode = await storage.getValidVerificationCode(email, code, "password_reset");
      
      if (!verificationCode) {
        return res.status(400).json({ message: "Código de verificación inválido o expirado" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Update password and unlock account
      const hashedPassword = await hashPassword(newPassword);
      await storage.updatePassword(user.id, hashedPassword);
      await storage.unlockUser(user.id);
      await storage.markCodeAsUsed(verificationCode.id);

      res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      console.error("Password reset confirmation error:", error);
      res.status(500).json({ message: "Error al actualizar la contraseña" });
    }
  });
}