import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Correct path to client index.html relative to project root
      const clientTemplate = path.resolve(
        process.cwd(), // Use process.cwd() for consistency
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // Add cache-busting query param to main.tsx import
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Correct path to the distribution directory relative to project root
  const distPath = path.resolve(process.cwd(), "dist", "public");
  log(`Serving static files from: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    log(`Error: Build directory not found at ${distPath}. Make sure to build the client first.`);
    // Optionally throw an error or handle differently
    // For now, just log and continue, the fallback in index.ts might handle it
    // throw new Error(
    //   `Could not find the build directory: ${distPath}, make sure to build the client first`
    // );
    return; // Exit if dist path doesn't exist
  }

  // Serve static assets from the dist/public directory
  app.use(express.static(distPath));

  // Remove the redundant fallback route from here.
  // The fallback route in server/index.ts handles serving index.html for client-side routing.
  // app.use("*", (_req, res) => {
  //   res.sendFile(path.resolve(distPath, "index.html"));
  // });
}

