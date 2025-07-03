import express from "express";
import cors from "cors";
import multer from "multer";
import { config } from "dotenv";
import { handleDemo } from "./routes/demo";
import { handleTranslatePdf } from "./routes/translate-pdf";

// Load environment variables
config();

export function createServer() {
  const app = express();

  // Configure multer for file uploads
  const upload = multer({
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed"));
      }
    },
  });

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(express.raw({ type: "application/pdf", limit: "50mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // PDF Translation endpoint
  app.post("/api/translate-pdf", handleTranslatePdf);

  return app;
}
