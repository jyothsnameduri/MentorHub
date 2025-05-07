import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertAvailabilitySchema, insertSessionSchema, insertFeedbackSchema, insertSkillSchema, insertActivitySchema } from "@shared/schema";
import { ZodError } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is a mentor
const isMentor = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated() && req.user?.role === "mentor") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Only mentors can access this resource" });
};

// Middleware to check if user is a mentee
const isMentee = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated() && req.user?.role === "mentee") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Only mentees can access this resource" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Error handler for Zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  };

  // Profile routes
  app.get("/api/profile/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Don't allow updating role or password through this endpoint
      const { role, password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to client
      const { password: pwd, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Mentor routes
  app.get("/api/mentors", isAuthenticated, async (req, res) => {
    try {
      const mentors = await storage.getAllMentors();
      // Remove passwords from response
      const mentorsWithoutPasswords = mentors.map(({ password, ...mentor }) => mentor);
      res.json(mentorsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mentors" });
    }
  });

  // Availability routes
  app.get("/api/mentors/:id/availability", isAuthenticated, async (req, res) => {
    try {
      const mentorId = parseInt(req.params.id);
      const availability = await storage.getAvailabilityForMentor(mentorId);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to get availability" });
    }
  });

  app.post("/api/availability", isMentor, async (req, res) => {
    try {
      const data = { ...req.body, mentorId: req.user?.id };
      const validatedData = insertAvailabilitySchema.parse(data);
      const availability = await storage.createAvailability(validatedData);
      res.status(201).json(availability);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.delete("/api/availability/:id", isMentor, async (req, res) => {
    try {
      const result = await storage.deleteAvailability(parseInt(req.params.id));
      if (!result) {
        return res.status(404).json({ message: "Availability not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

  // Session routes
  app.get("/api/session-requests", isMentor, async (req, res) => {
    try {
      const mentorId = req.user!.id;
      const pendingRequests = await storage.getPendingSessionRequests(mentorId);
      res.json(pendingRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get session requests" });
    }
  });
  
  app.post("/api/sessions/:id/approve", isMentor, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.mentorId !== req.user!.id) {
        return res.status(403).json({ message: "You can only approve your own session requests" });
      }
      
      const updatedSession = await storage.approveSessionRequest(sessionId);
      
      if (!updatedSession) {
        return res.status(400).json({ message: "Unable to approve session request" });
      }
      
      // Get mentee details
      const mentee = await storage.getUser(session.menteeId);
      
      // Create activities for both mentor and mentee
      await storage.createActivity({
        userId: req.user!.id,
        type: "session_approved",
        content: `You approved a session with ${mentee?.firstName} ${mentee?.lastName}`,
        relatedUserId: session.menteeId
      });
      
      await storage.createActivity({
        userId: session.menteeId,
        type: "session_confirmed",
        content: `${req.user!.firstName} ${req.user!.lastName} approved your session request`,
        relatedUserId: req.user!.id
      });
      
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve session request" });
    }
  });
  
  app.post("/api/sessions/:id/reject", isMentor, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.mentorId !== req.user!.id) {
        return res.status(403).json({ message: "You can only reject your own session requests" });
      }
      
      const updatedSession = await storage.rejectSessionRequest(sessionId);
      
      if (!updatedSession) {
        return res.status(400).json({ message: "Unable to reject session request" });
      }
      
      // Get mentee details
      const mentee = await storage.getUser(session.menteeId);
      
      // Create activities for both mentor and mentee
      await storage.createActivity({
        userId: req.user!.id,
        type: "session_rejected",
        content: `You declined a session with ${mentee?.firstName} ${mentee?.lastName}`,
        relatedUserId: session.menteeId
      });
      
      await storage.createActivity({
        userId: session.menteeId,
        type: "session_declined",
        content: `${req.user!.firstName} ${req.user!.lastName} declined your session request`,
        relatedUserId: req.user!.id
      });
      
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject session request" });
    }
  });
  
  app.post("/api/sessions", isMentee, async (req, res) => {
    try {
      const data = { ...req.body, menteeId: req.user?.id, status: "pending" };
      const validatedData = insertSessionSchema.parse(data);
      const session = await storage.createSession(validatedData);
      
      // Get mentor details
      const mentor = await storage.getUser(validatedData.mentorId);
      
      // Create activity for both mentee and mentor
      await storage.createActivity({
        userId: req.user!.id,
        type: "session_created",
        content: `You requested a session with ${mentor?.firstName} ${mentor?.lastName}`,
        relatedUserId: validatedData.mentorId
      });
      
      await storage.createActivity({
        userId: validatedData.mentorId,
        type: "session_requested",
        content: `${req.user!.firstName} ${req.user!.lastName} requested a session with you`,
        relatedUserId: req.user!.id
      });
      
      res.status(201).json(session);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const role = req.user?.role as "mentor" | "mentee";
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const sessions = await storage.getSessionsForUser(userId, role);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sessions" });
    }
  });

  app.get("/api/sessions/upcoming", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const role = req.user?.role as "mentor" | "mentee";
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const sessions = await storage.getUpcomingSessions(userId, role);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get upcoming sessions" });
    }
  });

  app.put("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check if the user is part of this session
      const userId = req.user?.id;
      if (session.mentorId !== userId && session.menteeId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this session" });
      }
      
      const updatedSession = await storage.updateSession(sessionId, req.body);
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Feedback routes
  app.post("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const data = { ...req.body, fromId: req.user?.id };
      const validatedData = insertFeedbackSchema.parse(data);
      const feedback = await storage.createFeedback(validatedData);
      
      // Create activity
      await storage.createActivity({
        userId: req.user!.id,
        type: "feedback_given",
        content: `You left feedback for a session`,
        relatedUserId: validatedData.toId
      });
      
      res.status(201).json(feedback);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.get("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const feedback = await storage.getFeedbackForUser(userId);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to get feedback" });
    }
  });

  // Skills routes
  app.get("/api/skills", isMentee, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const skills = await storage.getSkillsForMentee(userId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to get skills" });
    }
  });

  app.post("/api/skills", isMentee, async (req, res) => {
    try {
      const data = { ...req.body, menteeId: req.user?.id };
      const validatedData = insertSkillSchema.parse(data);
      const skill = await storage.createSkill(validatedData);
      res.status(201).json(skill);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put("/api/skills/:id", isMentee, async (req, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const { progress } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
      }
      
      const updatedSkill = await storage.updateSkill(skillId, progress);
      if (!updatedSkill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(updatedSkill);
    } catch (error) {
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  // Activity routes
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivitiesForUser(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });

  // Create a server
  const httpServer = createServer(app);

  return httpServer;
}
