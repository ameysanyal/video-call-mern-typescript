import express, { NextFunction, Request, Response } from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '@/middlewares/errorHandler.middleware.js';
import swaggerRoute from '@/swagger.js';
import authRoutes from '@/routes/auth.route.js';
import userRoutes from '@/routes/user.route.js';
import chatRoutes from '@/routes/chat.route.js';
import { morganMiddleware } from '@/config/morgan.config.js';
import sanitize from 'mongo-sanitize';
import rateLimit from 'express-rate-limit';

// Create the Express app instance
const app = express();
app.use(helmet());
app.set('trust proxy', 1);
// tells Express to trust the first proxy in front of the application,
// allowing it to correctly determine the client's original IP address and protocol.
// By default, Express doesn't trust the headers from a proxy.
// The value 1 is sufficient for a single proxy like NGINX.

// Configure middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:80',
      'http://localhost',
      'http://ameystack.in',
      'https://ameystack.in',
      'https://streamifyit.netlify.app',
    ],
    credentials: true,
  })
);

// Limit repeated requests to APIs (basic DoS protection)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max requests per IP
  })
);

app.use(express.json());

// Place the sanitization middleware in your Express application before any route handlers that process user input.
// Custom sanitize middleware

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);

  if (req.query) {
    for (const key in req.query) {
      req.query[key] = sanitize(req.query[key]);
    }
  }

  next();
});

app.use(cookieParser());

// Add Morgan middleware before your routes
app.use(morganMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api-docs', swaggerRoute);

// Simple root route
app.get('/', (req: Request, res: Response) => {
  res.send(`hello checking backend`);
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler middleware
app.use(errorHandler);

// Export the app for server.js to use and for testing
export default app;
