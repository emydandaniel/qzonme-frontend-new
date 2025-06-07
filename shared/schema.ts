import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

// Quiz schema
export const quizzes = sqliteTable("quizzes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  creatorId: integer("creator_id").notNull(),
  creatorName: text("creator_name").notNull(),
  accessCode: text("access_code").notNull().unique(),
  urlSlug: text("url_slug").notNull().unique(),
  dashboardToken: text("dashboard_token").notNull().unique(),
  createdAt: text("created_at").default(sql => `CURRENT_TIMESTAMP`).notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

// Question schema
export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id").notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(), // Now only "multiple-choice"
  options: text("options").notNull().$type<string>(), // JSON stored as text
  correctAnswers: text("correct_answers").notNull().$type<string>(), // JSON stored as text
  hint: text("hint"), // Keeping for backwards compatibility
  order: integer("order").notNull(), // Question order in the quiz
  imageUrl: text("image_url"), // Added for storing image URLs for questions
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

// QuizAttempt schema
export const quizAttempts = sqliteTable("quiz_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id").notNull(),
  userAnswerId: integer("user_answer_id").notNull(),
  userName: text("user_name").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: text("answers").notNull().$type<string>(), // JSON stored as text
  completedAt: text("completed_at").default(sql => `CURRENT_TIMESTAMP`).notNull(),
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  completedAt: true,
});

// Question Answer schema for validation
export const questionAnswerSchema = z.object({
  questionId: z.number(),
  userAnswer: z.union([z.string(), z.array(z.string())]),
  isCorrect: z.boolean().optional(),
});

// Helper function to parse JSON from text fields
export function parseJsonField<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.error("Error parsing JSON field:", e);
    return null;
  }
}

// Helper function to stringify JSON for text fields
export function stringifyJsonField<T>(value: T): string {
  return JSON.stringify(value);
}

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;
