import * as expressSession from "express-session";
import connectPg from "connect-pg-simple";
import {
  User,
  InsertUser,
  Availability,
  InsertAvailability,
  Session,
  InsertSession,
  Feedback,
  InsertFeedback,
  Skill,
  InsertSkill,
  Activity,
  InsertActivity,
  users,
  availability,
  sessions,
  feedback,
  skills,
  activities
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { IStorage } from "./storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read meet links once at startup
const meetLinks = fs.readFileSync(
  path.join(__dirname, '../meet collection.txt'),
  'utf-8'
)
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.startsWith('https://meet.google.com/'));

function getRandomMeetLink() {
  return meetLinks[Math.floor(Math.random() * meetLinks.length)];
}

export class DatabaseStorage implements IStorage {
  sessionStore: expressSession.Store;

  constructor() {
    const PostgresSessionStore = connectPg(expressSession);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values({
      ...user,
      title: user.title || null,
      organization: user.organization || null,
      bio: user.bio || null,
      profileImage: user.profileImage || null,
      specialties: user.specialties || null,
      created: new Date()
    }).returning();
    return createdUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async getAllMentors(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "mentor"));
  }
  
  async getAllMentees(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "mentee"));
  }

  // Availability methods
  async getAvailabilityForMentor(mentorId: number): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(eq(availability.mentorId, mentorId));
  }

  async createAvailability(avail: InsertAvailability): Promise<Availability> {
    const [createdAvailability] = await db
      .insert(availability)
      .values(avail)
      .returning();
      
    return createdAvailability;
  }

  async deleteAvailability(id: number): Promise<boolean> {
    const result = await db
      .delete(availability)
      .where(eq(availability.id, id))
      .returning({ id: availability.id });
      
    return result.length > 0;
  }

  // Session methods
  async createSession(session: InsertSession): Promise<Session> {
    const [createdSession] = await db
      .insert(sessions)
      .values({
        ...session,
        created: new Date(),
        status: session.status || "pending",
        notes: session.notes || null,
        meetingLink: session.meetingLink || null
      })
      .returning();
    
    return createdSession;
  }

  async getSessionById(id: number): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));
      
    return session;
  }

  async getSessionsForUser(userId: number, role: "mentor" | "mentee"): Promise<Session[]> {
    // Use strict filtering based on user's role
    const column = role === "mentor" ? sessions.mentorId : sessions.menteeId;
    
    // Get only sessions specifically assigned to this user based on their role
    return await db
      .select()
      .from(sessions)
      .where(eq(column, userId))
      .orderBy(desc(sessions.date));
  }

  async getUpcomingSessions(userId: number, role: "mentor" | "mentee"): Promise<Session[]> {
    // Make sure to filter strictly by role - mentor or mentee
    const column = role === "mentor" ? sessions.mentorId : sessions.menteeId;
    const today = new Date().toISOString().split('T')[0];
    
    // For mentors, include both approved and pending sessions
    // For mentees, only include approved sessions
    const statusCondition = role === "mentor" 
      ? sql`${sessions.status} IN ('approved', 'pending')`
      : eq(sessions.status, "approved");
    
    // Get sessions that are assigned to this specific user in their role
    return await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(column, userId),
          statusCondition,
          sql`${sessions.date} >= ${today}`
        )
      )
      .orderBy(sessions.date);
  }

  async getPendingSessionRequests(mentorId: number): Promise<Session[]> {
    // Strictly filter for the specific mentor's pending session requests only
    return await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.mentorId, mentorId),  // Only get pending requests for this specific mentor
          eq(sessions.status, "pending")
        )
      )
      .orderBy(sessions.date);
  }

  async approveSessionRequest(sessionId: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (!session) return undefined;
    
    // Assign a random Google Meet link from meet collection.txt
    const meetingLink = getRandomMeetLink();
    
    const [updatedSession] = await db
      .update(sessions)
      .set({
        status: "approved",
        meetingLink
      })
      .where(eq(sessions.id, sessionId))
      .returning();
      
    return updatedSession;
  }

  async rejectSessionRequest(sessionId: number): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set({
        status: "rejected"
      })
      .where(eq(sessions.id, sessionId))
      .returning();
      
    return updatedSession;
  }

  async updateSession(id: number, data: Partial<Session>): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.id, id))
      .returning();
      
    return updatedSession;
  }

  // Feedback methods
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [createdFeedback] = await db
      .insert(feedback)
      .values({
        ...feedbackData,
        created: new Date(),
        comment: feedbackData.comment || null
      })
      .returning();
      
    return createdFeedback;
  }

  async getFeedbackForUser(userId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.toId, userId));
  }
  
  async getFeedbackGivenByUser(userId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.fromId, userId));
  }
  
  async getFeedbackBySessionAndUser(sessionId: number, userId: number): Promise<Feedback | undefined> {
    const [existingFeedback] = await db
      .select()
      .from(feedback)
      .where(
        and(
          eq(feedback.sessionId, sessionId),
          eq(feedback.fromId, userId)
        )
      );
      
    return existingFeedback;
  }

  // Skills methods
  async getSkillsForMentee(menteeId: number): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(eq(skills.menteeId, menteeId));
  }

  async createSkill(skillData: InsertSkill): Promise<Skill> {
    const [createdSkill] = await db
      .insert(skills)
      .values({
        ...skillData,
        progress: skillData.progress || 0,
        updated: new Date()
      })
      .returning();
      
    return createdSkill;
  }

  async updateSkill(id: number, progress: number): Promise<Skill | undefined> {
    const [updatedSkill] = await db
      .update(skills)
      .set({
        progress,
        updated: new Date()
      })
      .where(eq(skills.id, id))
      .returning();
      
    return updatedSkill;
  }

  // Activity methods
  async getActivitiesForUser(userId: number, limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.created))
      .limit(limit);
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [createdActivity] = await db
      .insert(activities)
      .values({
        ...activityData,
        created: new Date(),
        relatedUserId: activityData.relatedUserId || null
      })
      .returning();
      
    return createdActivity;
  }
}