import express, { Request, Response } from 'express';
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
app.use(express.json());
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

// Global error handler middleware
app.use(errorHandler);

// Export the app for server.js to use and for testing
export default app;
