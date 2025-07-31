import express, { Request, Response, NextFunction }  from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from 'path';
import { Env } from "./config/env.config.js";
import { appLogger } from './config/logger.js';
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import connectDatabase from "./config/database.config.js";
import { fileURLToPath } from 'url';

const app = express();
const PORT = Env.PORT;
const logger = appLogger;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow frontend to send cookies
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (Env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req:Request, res:Response) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.get('/',(req,res)=>{
  res.send(`hello checking backend`)
})

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${Env.NODE_ENV} mode`);
  connectDatabase();
});

// Example of unhandled errors logging (using the winstonLogger directly for global catches)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optional: exit process or gracefully shut down
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Optional: exit process or gracefully shut down
  process.exit(1);
});
