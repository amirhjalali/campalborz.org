import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router";
import { createContext } from "./context";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? [process.env.PLATFORM_DOMAIN || ""] 
    : true,
  credentials: true,
}));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// tRPC middleware
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Start server
app.listen(port, () => {
  console.log(`🚀 API server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔧 tRPC endpoint: http://localhost:${port}/api/trpc`);
});