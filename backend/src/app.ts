import express, { Request, Response } from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import { Env } from '@/config/env.config.js';
import { errorHandler } from '@/middlewares/errorHandler.middleware.js';
import swaggerRoute from '@/swagger.js';
import authRoutes from '@/routes/auth.route.js';
import userRoutes from '@/routes/user.route.js';
import chatRoutes from '@/routes/chat.route.js';
import { fileURLToPath } from 'url';
import { morganMiddleware } from '@/config/morgan.config.js';

// Create the Express app instance
const app = express();
app.use(helmet());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Add Morgan middleware before your routes
app.use(morganMiddleware);

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api-docs', swaggerRoute);

// Serve frontend in production
if (Env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Simple root route
app.get('/', (req, res) => {
  res.send(`hello checking backend`);
});

// Global error handler middleware
app.use(errorHandler);

// Export the app for server.js to use and for testing
export default app;
