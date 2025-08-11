import { z } from 'zod';

const signupSchema = {
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(1, 'Full name is required'),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
  }),
};

const onboardSchema = {
  body: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    bio: z.string().min(1, 'Bio is required'),
    nativeLanguage: z.string().min(1, 'Native language is required'),
    learningLanguage: z.string().min(1, 'Learning language is required'),
    location: z.string().min(1, 'Location is required'),
  }),
};

export { signupSchema, loginSchema, onboardSchema };
