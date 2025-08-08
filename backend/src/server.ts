import app from "@/app.js";
import { Env } from "@/config/env.config.js";
import { appLogger } from "@/config/logger.js";
import connectDatabase from "@/config/database.config.js";

const PORT = Env.PORT;
const logger = appLogger;

// Connect to the database
connectDatabase();

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${Env.NODE_ENV} mode`);
});

// Handle unhandled errors
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  server.close(() => {
    process.exit(1);
  });
});
