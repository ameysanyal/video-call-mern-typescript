import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import JWT from 'jsonwebtoken';
import { DecodedToken } from '../../src/types/jwt.types.js';

describe('Auth Integration Tests', () => {
  const signupEndpoint = '/api/auth/signup';
  const loginEndpoint = '/api/auth/login';
  const logoutEndpoint = '/api/auth/logout';
  const meEndpoint = '/api/auth/me';
  const onboardEndpoint = '/api/auth/onboarding';

  const userPayload = {
    email: 'testuser@streamify.com',
    password: 'Password123',
    fullName: 'Test User',
  };

  it('should signup a new user and set jwt cookie', async () => {
    const res = await request(app).post(signupEndpoint).send(userPayload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      data: { email: userPayload.email, fullName: userPayload.fullName },
    });
    expect(res.body.data._id).toBeDefined();

    const cookies = Array.isArray(res.headers['set-cookie']) ? res.headers['set-cookie'] : [];
    expect(cookies.some((cookie) => cookie.startsWith('jwt='))).toBe(true);

    const jwtCookie = cookies.find((cookie) => cookie.startsWith('jwt='));
    expect(jwtCookie).toBeDefined();

    const token = jwtCookie.split(';')[0].split('=')[1];
    const decoded = JWT.decode(token) as DecodedToken;

    expect(decoded).toHaveProperty('userId');
    expect(typeof decoded.userId).toBe('string');
  });

  it('should not signup with missing fields', async () => {
    const res = await request(app).post(signupEndpoint).send({
      email: 'bademail',
      password: '',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
  });

  it('should login an existing user and set jwt cookie', async () => {
    // Signup first
    await request(app).post(signupEndpoint).send(userPayload);

    const res = await request(app).post(loginEndpoint).send({
      email: userPayload.email,
      password: userPayload.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.email).toBe(userPayload.email);

    const cookies = Array.isArray(res.headers['set-cookie']) ? res.headers['set-cookie'] : [];
    expect(cookies.some((cookie) => cookie.startsWith('jwt='))).toBe(true);

    const jwtCookie = cookies.find((cookie) => cookie.startsWith('jwt='));
    expect(jwtCookie).toBeDefined();

    const token = jwtCookie.split(';')[0].split('=')[1];
    const decoded = JWT.decode(token) as DecodedToken;

    expect(decoded).toHaveProperty('userId');
    expect(typeof decoded.userId).toBe('string');
  });

  it('should return current user on /me with valid jwt cookie', async () => {
    const signupRes = await request(app).post(signupEndpoint).send(userPayload);

    const cookies = Array.isArray(signupRes.headers['set-cookie'])
      ? signupRes.headers['set-cookie']
      : [];

    const jwtCookie = cookies.find((cookie) => cookie.startsWith('jwt='));

    const res = await request(app).get(meEndpoint).set('Cookie', jwtCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.user.email).toBe(userPayload.email);
  });

  it('should logout and clear jwt cookie', async () => {
    const res = await request(app).post(logoutEndpoint);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);

    const cookies = Array.isArray(res.headers['set-cookie']) ? res.headers['set-cookie'] : [];
    expect(cookies.some((cookie) => cookie.startsWith('jwt=;'))).toBe(true);
  });

  it('should onboard user with valid jwt cookie', async () => {
    const signupRes = await request(app).post(signupEndpoint).send(userPayload);

    const cookies = Array.isArray(signupRes.headers['set-cookie'])
      ? signupRes.headers['set-cookie']
      : [];

    const jwtCookie = cookies.find((cookie) => cookie.startsWith('jwt='));

    const onboardPayload = {
      fullName: 'Test User',
      bio: 'I love testing',
      nativeLanguage: 'English',
      learningLanguage: 'Spanish',
      location: 'Earth',
    };

    const res = await request(app)
      .post(onboardEndpoint)
      .set('Cookie', jwtCookie)
      .send(onboardPayload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.isOnboarded).toBe(true);
    expect(res.body.data.bio).toBe(onboardPayload.bio);
  });

  it('should reject onboarding without jwt cookie', async () => {
    const onboardPayload = {
      fullName: 'Test User',
      bio: 'I love testing',
      nativeLanguage: 'English',
      learningLanguage: 'Spanish',
      location: 'Earth',
    };

    const res = await request(app).post(onboardEndpoint).send(onboardPayload);

    expect(res.status).toBe(401);
  });
});

// Clear Arrange, Act, Assert comments aren’t necessary but you have that structure by convention.

// We parse and check the jwt cookie from set-cookie headers explicitly.

// We decode the JWT token to verify payload (userId).

// Consistent use of Array.isArray() to safely handle set-cookie.

// Tests cover:

// signup success + JWT cookie + token decode

// signup failure (bad input)

// login success + JWT cookie + token decode

// /me with cookie returns user

// logout clears cookie

// onboarding with cookie success

// onboarding fails without cookie
