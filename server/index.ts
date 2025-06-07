import express, { type Request, Response, NextFunction } from "express";
import cors from "cors"; // Import cors
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import * as pathModule from "path";
import * as fs from "fs";
import { scheduleCleanupTask } from './cleanup';
import { testCloudinaryConnection } from './cloudinary';

const app = express();

// Enable CORS for all origins in development, restrict in production
const corsOptions = {
  origin: process.env.NODE_ENV === "development" 
    ? "*" 
    : ["https://your-vercel-frontend-url.vercel.app", "http://localhost:5000"], // Replace with actual Vercel URL
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Special route for sitemap.xml - ensure it's served with XML content type
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = pathModule.join(process.cwd(), 'public', 'sitemap.xml');
  fs.readFile(sitemapPath, (err, data) => {
    if (err) {
      res.status(500).send('Error reading sitemap file');
      return;
    }
    res.header('Content-Type', 'application/xml');
    res.send(data);
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // Removed throw err; to prevent server crash on error
    console.error("Error handled:", err); // Log the error instead
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
    
    // History API fallback - serve index.html for any route that doesn't match an API or static resource
    // This is necessary for client-side routing to work with direct URL access
    app.get('*', (req, res, next) => {
      // Skip API routes and specific file types
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.includes('.')) {
        return next(); // Pass to next middleware if it's an API call, upload, or has an extension
      }
      
      // For all other routes, serve the index.html file
      const distPath = pathModule.resolve(process.cwd(), "dist", "public"); // Adjusted path for production build
      res.sendFile(pathModule.resolve(distPath, "index.html"));
    });
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Test Cloudinary connection
    try {
      const cloudinaryTestResult = await testCloudinaryConnection();
      if (cloudinaryTestResult.success) {
        log('Cloudinary connection successful');
      } else {
        log('Warning: Could not connect to Cloudinary - image uploads may fail');
      }
    } catch (error) {
      log(`Error testing Cloudinary connection: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Schedule daily cleanup task to run 5 minutes after server start
    scheduleCleanupTask(5 * 60 * 1000);
    log('Scheduled daily cleanup task for expired quizzes (7-day retention period)');
  });
})();

