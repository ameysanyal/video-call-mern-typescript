import morgan from "morgan";
import { appLogger } from "@/config/logger.js";
import { Env } from "@/config/env.config.js";

// Custom stream to pipe Morgan output to Winston's info level
const stream = {
  write: (message: string) => appLogger.http(message.trim()),
};

// Morgan format string for production logs
const prodFormat =
  ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

// Morgan format string for development logs (more concise)
const devFormat = "dev";

// Morgan middleware configuration
export const morganMiddleware = morgan(
  Env.NODE_ENV === "production" ? prodFormat : devFormat,
  {
    stream,
  }
);
