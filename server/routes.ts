import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  insertUserSchema, 
  insertQuizSchema, 
  insertQuestionSchema, 
  insertQuizAttemptSchema,
  questionAnswerSchema,
  quizzes,
  quizAttempts,
  questions,
  users // Added users table import
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { registerContactRoutes } from "./routes/contact";
import { eq } from "drizzle-orm"; // Import eq for queries
import { log } from "./vite"; // Assuming log function is available

// Setup dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup temporary upload directory for processing before sending to Cloudinary
const projectRoot = path.resolve(__dirname, "..");
const tempUploadDir = path.join(projectRoot, "temp_uploads");

log(`Project root: ${projectRoot}`);
log(`Temp upload directory: ${tempUploadDir}`);

// Ensure temp directory exists
if (!fs.existsSync(tempUploadDir)) {
  try {
    fs.mkdirSync(tempUploadDir, { recursive: true });
    log(`Created temp upload directory: ${tempUploadDir}`);
  } catch (error) {
    log(`Error creating temp upload directory: ${error instanceof Error ? error.message : String(error)}`);
    // Consider if this should be a fatal error depending on deployment environment needs
  }
}

// Use multer with temporary storage
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempUploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    log(`New temp upload: ${filename}`);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // Increased to 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) { // Added case-insensitive flag
      // @ts-ignore - Multer types aren't perfect
      return cb(new Error("Only image files (jpg, jpeg, png, gif) are allowed!"), false);
    }
    cb(null, true);
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.username, userData.username)).limit(1);
      if (existingUser.length > 0) {
        // User exists, return existing user data
        log(`User "${userData.username}" already exists. Returning existing user.`);
        res.status(200).json(existingUser[0]);
      } else {
        // User does not exist, create new user
        log(`Creating new user: "${userData.username}"`);
        const user = await storage.createUser(userData);
        res.status(201).json(user);
      }
    } catch (error) {
      log(`Error in POST /api/users: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", error: error.flatten() });
      } else {
        res.status(500).json({ message: "Failed to process user request" });
      }
    }
  });

  // Quiz routes
  app.post("/api/quizzes", async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);

      // Additional server-side validation for creator name
      if (!quizData.creatorName || quizData.creatorName.trim() === "") {
        log("Validation Error: Creator name cannot be empty");
        return res.status(400).json({
          message: "Creator name cannot be empty",
          error: "EMPTY_CREATOR_NAME",
        });
      }

      // Extra validation to catch any instance of the known default value
      if (quizData.creatorName.toLowerCase() === "emydan") {
        log("CRITICAL BUG DETECTED: Default name 'emydan' was submitted");
        return res.status(400).json({
          message: "Cannot use default creator name. Please enter your own name.",
          error: "DEFAULT_CREATOR_NAME_USED",
        });
      }

      log(`Creating quiz with creator name: "${quizData.creatorName}"`);

      const quiz = await storage.createQuiz(quizData);
      res.status(201).json(quiz);
    } catch (error) {
      log(`Error in POST /api/quizzes: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid quiz data", error: error.flatten() });
      } else {
        res.status(500).json({ message: "Failed to create quiz" });
      }
    }
  });

  // Get all quizzes (for testing/admin)
  app.get("/api/quizzes", async (req, res) => {
    try {
      log("Fetching all quizzes...");
      const allQuizzes = await db.select().from(quizzes);
      res.json(allQuizzes);
    } catch (error) {
      log(`Error fetching all quizzes: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Get quiz by access code
  app.get("/api/quizzes/code/:accessCode", async (req, res) => {
    try {
      const accessCode = req.params.accessCode;
      log(`Fetching quiz by access code: ${accessCode}`);
      const quiz = await storage.getQuizByAccessCode(accessCode);

      if (!quiz) {
        log(`Quiz not found for access code: ${accessCode}`);
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Check if the quiz is expired
      const isExpired = storage.isQuizExpired(quiz);
      if (isExpired) {
        log(`Quiz ${quiz.id} (code: ${accessCode}) is expired.`);
        return res.status(410).json({
          message: "Quiz expired",
          expired: true,
          detail: "This quiz has expired. Quizzes are available for 7 days after creation.",
        });
      }

      res.json(quiz);
    } catch (error) {
      log(`Error fetching quiz by access code ${req.params.accessCode}: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Get quiz by URL slug
  app.get("/api/quizzes/slug/:urlSlug", async (req, res) => {
    try {
      const urlSlug = req.params.urlSlug;
      log(`Fetching quiz by URL slug: "${urlSlug}"`);

      let quiz = await storage.getQuizByUrlSlug(urlSlug);

      // Case-insensitive fallback (consider performance implications on large datasets)
      if (!quiz) {
        log(`Exact slug match failed for "${urlSlug}". Trying case-insensitive search...`);
        const allQuizzesList = await db.select().from(quizzes);
        const slugMatch = allQuizzesList.find(
          (q) => q.urlSlug.toLowerCase() === urlSlug.toLowerCase(),
        );
        if (slugMatch) {
          quiz = slugMatch;
          log(`Found quiz with case-insensitive match: ${slugMatch.urlSlug}`);
        } else {
          log(`No quiz found with URL slug: "${urlSlug}" (case-insensitive)`);
          return res.status(404).json({ message: "Quiz not found" });
        }
      }

      // Check if the quiz is expired
      const isExpired = storage.isQuizExpired(quiz);
      if (isExpired) {
        log(`Quiz ${quiz.id} (slug: ${urlSlug}) is expired.`);
        return res.status(410).json({
          message: "Quiz expired",
          expired: true,
          detail: "This quiz has expired. Quizzes are available for 7 days after creation.",
        });
      }

      res.json(quiz);
    } catch (error) {
      log(`Error fetching quiz by slug "${req.params.urlSlug}": ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Get quiz by dashboard token
  app.get("/api/quizzes/dashboard/:token", async (req, res) => {
    try {
      const dashboardToken = req.params.token;
      log(`Fetching quiz by dashboard token: "${dashboardToken}"`);

      const quiz = await storage.getQuizByDashboardToken(dashboardToken);

      if (!quiz) {
        log(`No quiz found with dashboard token: "${dashboardToken}"`);
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Check if the quiz is expired
      const isExpired = storage.isQuizExpired(quiz);
      if (isExpired) {
        log(`Quiz ${quiz.id} (dashboard token: ${dashboardToken}) is expired.`);
        return res.status(410).json({
          message: "Quiz expired",
          expired: true,
          detail: "This quiz has expired. Quizzes are available for 7 days after creation.",
        });
      }

      res.json(quiz);
    } catch (error) {
      log(`Error fetching quiz by dashboard token "${req.params.token}": ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Get quiz by ID
  app.get("/api/quizzes/:quizId", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      log(`Fetching quiz by ID: ${quizId}`);

      if (isNaN(quizId)) {
        log(`Invalid quiz ID received: ${req.params.quizId}`);
        return res.status(400).json({ message: "Invalid quiz ID" });
      }

      const quiz = await storage.getQuiz(quizId);

      if (!quiz) {
        log(`Quiz not found for ID: ${quizId}`);
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Check if the quiz is expired
      const isExpired = storage.isQuizExpired(quiz);
      if (isExpired) {
        log(`Quiz ${quizId} is expired.`);
        return res.status(410).json({
          message: "Quiz expired",
          expired: true,
          detail: "This quiz has expired. Quizzes are available for 7 days after creation.",
        });
      }

      log(`GET /api/quizzes/${quizId} response:`, quiz);
      res.json(quiz);
    } catch (error) {
      log(`Error fetching quiz ${req.params.quizId}: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Question routes
  app.post("/api/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      log(`Creating new question for quiz ID: ${questionData.quizId}`);
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      log(`Error in POST /api/questions: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid question data", error: error.flatten() });
      } else {
        res.status(500).json({ message: "Failed to create question" });
      }
    }
  });

  // Get questions for a specific quiz
  app.get("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      log(`Fetching questions for quiz ID: ${quizId}`);

      if (isNaN(quizId)) {
        log(`Invalid quiz ID received: ${req.params.quizId}`);
        return res.status(400).json({ message: "Invalid quiz ID" });
      }

      const questionsResult = await storage.getQuestionsByQuizId(quizId);
      res.json(questionsResult);
    } catch (error) {
      log(`Error fetching questions for quiz ${req.params.quizId}: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Quiz attempt routes
  app.post("/api/quiz-attempts", async (req, res) => {
    try {
      const attemptData = insertQuizAttemptSchema.parse(req.body);
      log(`Creating quiz attempt for quiz ID: ${attemptData.quizId} by ${attemptData.takerName}`);
      const attempt = await storage.createQuizAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error) {
      log(`Error in POST /api/quiz-attempts: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid attempt data", error: error.flatten() });
      } else {
        res.status(500).json({ message: "Failed to create quiz attempt" });
      }
    }
  });

  // Get attempts for a specific quiz
  app.get("/api/quizzes/:quizId/attempts", async (req, res) => {
    try {
      // Add aggressive anti-caching headers
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      const quizId = parseInt(req.params.quizId);
      const timestamp = Date.now(); // For debugging
      log(`[${timestamp}] Fetching attempts for quiz ${quizId}`);

      if (isNaN(quizId)) {
        log(`Invalid quiz ID received: ${req.params.quizId}`);
        return res.status(400).json({ message: "Invalid quiz ID" });
      }

      // Add a small delay? Consider if necessary or if DB transaction isolation handles this.
      // await new Promise(resolve => setTimeout(resolve, 100));

      const attempts = await storage.getQuizAttempts(quizId);
      log(`[${timestamp}] Found ${attempts.length} attempts for quiz ${quizId}`);

      // Sort attempts by completion date (newest first)
      attempts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      log(`[${timestamp}] Sending sorted attempts: ${attempts.map((a) => a.id).join(", ")}`);

      res.json({
        data: attempts,
        serverTime: timestamp,
        count: attempts.length,
      });
    } catch (error) {
      log(`Error fetching quiz attempts for quiz ${req.params.quizId}: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  // Get specific quiz attempt by ID
  app.get("/api/quiz-attempts/:attemptId", async (req, res) => {
    try {
      // Add anti-caching headers
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      const attemptId = parseInt(req.params.attemptId);
      const timestamp = Date.now(); // For tracing and debugging
      log(`[${timestamp}] Fetching attempt with ID ${attemptId}`);

      if (isNaN(attemptId)) {
        log(`Invalid attempt ID received: ${req.params.attemptId}`);
        return res.status(400).json({ message: "Invalid attempt ID" });
      }

      // Fetch attempt directly by ID
      const attemptResult = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId)).limit(1);
      const attempt = attemptResult[0];

      if (!attempt) {
        log(`[${timestamp}] Attempt ID ${attemptId} not found`);
        return res.status(404).json({ message: "Quiz attempt not found" });
      }

      log(`[${timestamp}] Found attempt ${attemptId} (quiz ${attempt.quizId})`);

      // Send with timestamp for caching verification
      res.json({
        data: attempt,
        serverTime: timestamp,
      });
    } catch (error) {
      log(`Error fetching quiz attempt ${req.params.attemptId}: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ message: "Failed to fetch quiz attempt" });
    }
  });

  // Verify an answer
  app.post("/api/questions/:questionId/verify", async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId);
      log(`Verifying answer for question ID: ${questionId}`);

      if (isNaN(questionId)) {
        log(`Invalid question ID received: ${req.params.questionId}`);
        return res.status(400).json({ message: "Invalid question ID" });
      }

      const answerData = z
        .object({
          answer: z.union([z.string(), z.array(z.string())]),
        })
        .parse(req.body);

      // Fetch the specific question by ID
      const questionResult = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
      const question = questionResult[0];

      if (!question) {
        log(`[SERVER ERROR] Question not found: ${questionId}`);
        return res.status(404).json({ message: "Question not found" });
      }

      let isCorrect = false;
      // Ensure correctAnswers is treated as an array
      const correctAnswers = Array.isArray(question.correctAnswers) 
                             ? question.correctAnswers 
                             : JSON.parse(question.correctAnswers as string);
                             
      const userAnswer = answerData.answer;

      log(`- Correct answers:`, correctAnswers);
      log(`- User answer:`, userAnswer);

      if (Array.isArray(userAnswer)) {
        // For multiple answers (select_all), check if sets match exactly
        const userAnswersSet = new Set(userAnswer.map(ans => ans.toLowerCase().trim()));
        const correctAnswersSet = new Set(correctAnswers.map(correct => correct.toLowerCase().trim()));
        isCorrect = userAnswersSet.size === correctAnswersSet.size && 
                    [...userAnswersSet].every(ans => correctAnswersSet.has(ans));
      } else {
        // For single answer (multiple_choice), check if it matches any correct answer
        const normalizedUserAnswer = userAnswer.toString().toLowerCase().trim();
        isCorrect = correctAnswers.some(
          (correct) => correct.toLowerCase().trim() === normalizedUserAnswer,
        );
      }

      log(`Answer is ${isCorrect ? "CORRECT" : "INCORRECT"}`);

      res.json({
        isCorrect,
        // Optionally remove debug info in production
        // debug: {
        //   questionText: question.text,
        //   correctAnswers: correctAnswers,
        //   userAnswer: userAnswer
        // }
      });
    } catch (error) {
      log(`Error verifying answer for question ${req.params.questionId}: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid answer data", error: error.flatten() });
      } else {
        res.status(500).json({ message: "Failed to verify answer" });
      }
    }
  });

  // Image upload route
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        log("Upload Error: No file uploaded.");
        return res.status(400).json({ message: "No file uploaded" });
      }

      log(`Processing uploaded file: ${req.file.filename} (path: ${req.file.path})`);
      
      // Upload the file from the temporary path to Cloudinary
      const result = await storage.uploadImage(req.file.path);
      log(`Cloudinary upload successful: ${result.secure_url}`);

      // Clean up the temporary file after successful upload
      try {
        fs.unlinkSync(req.file.path);
        log(`Deleted temp file: ${req.file.path}`);
      } catch (cleanupError) {
        log(`Error deleting temp file ${req.file.path}: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
        // Non-fatal error, proceed with response
      }

      res.json({ imageUrl: result.secure_url });
    } catch (error) {
      log(`Error during image upload: ${error instanceof Error ? error.message : String(error)}`);
      // Clean up temp file even if Cloudinary upload failed
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          log(`Deleted temp file after error: ${req.file.path}`);
        } catch (cleanupError) {
          log(`Error deleting temp file ${req.file.path} after error: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
        }
      }
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Register contact form routes
  registerContactRoutes(app);

  const server = createServer(app);
  return server;
}

