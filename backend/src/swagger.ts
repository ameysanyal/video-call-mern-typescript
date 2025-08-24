import express, { Request, Response } from 'express';
import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const router = express.Router();
import { Env } from '@/config/env.config.js';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API Docs',
    },
    tags: [
      {
        name: 'auth',
        description: 'Auth API',
      },
      {
        name: 'users',
        description: 'Users API',
      },
      {
        name: 'chat',
        description: 'Chat API',
      },
    ],
    servers: [
      {
        url: process.env.PUBLIC_API_URL,
        description: 'Production server',
      },
      {
        url: `http://localhost:${Env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
          description:
            "JWT authorization via cookie. The cookie named 'jwt' contains the JSON Web Token for authenticating requests.",
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key authorization of an API',
        },
      },
      schemas: {
        // Here's where you add your schemas
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            profilePic: { type: 'string' },
            isOnboarded: { type: 'boolean' },
            nativeLanguage: { type: 'string' },
            learningLanguage: { type: 'string' },
            location: { type: 'string' },
            bio: { type: 'string' },
          },
        },
        SignupBody: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', example: 'John Doe' },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123',
            },
          },
        },
        LoginBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
          },
        },
        OnboardBody: {
          type: 'object',
          required: ['fullName', 'bio', 'nativeLanguage', 'learningLanguage', 'location'],
          properties: {
            fullName: { type: 'string', example: 'John Doe' },
            bio: {
              type: 'string',
              example: 'I am learning Spanish and looking for language partners!',
            },
            nativeLanguage: { type: 'string', example: 'english' },
            learningLanguage: { type: 'string', example: 'spanish' },
            location: { type: 'string', example: 'New York, USA' },
            profilePic: {
              type: 'string',
              example: 'https://avatar.iran.liara.run/public/33.png',
            },
          },
        },
        FriendRequest: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '64f3bdc6d762e945a7b7fbee',
            },
            sender: {
              $ref: '#/components/schemas/User',
            },
            recipient: {
              $ref: '#/components/schemas/User',
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted'],
              example: 'pending',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts'], // path to your route files with JSDoc
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

router.get('/json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

router.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      withCredentials: true,
      persistAuthorization: true,
    },
  })
);

export default router;
