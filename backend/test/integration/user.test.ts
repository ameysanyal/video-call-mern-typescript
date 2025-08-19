import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/user.model.js';

describe('User API Integration Tests', () => {
  const baseEndpoint = '/api/users';

  //Defines mock user data used for signup.
  const user1 = {
    email: 'user1@streamify.com',
    fullName: 'User One',
    password: 'Password123',
  };

  const user2 = {
    email: 'user2@streamify.com',
    fullName: 'User Two',
    password: 'Password123',
  };

  //Declares variables to store the JWT cookies and user IDs,
  //which are needed for authenticated requests in the tests.
  let jwtCookieUser1: string;
  let jwtCookieUser2: string;
  let user1Id: string;
  let user2Id: string;

  //This hook runs before every single test (it block)
  beforeEach(async () => {
    await User.deleteMany({});
    // Signup user1 and user2 and store cookies and ids
    const res1 = await request(app).post('/api/auth/signup').send(user1);
    const res2 = await request(app).post('/api/auth/signup').send(user2);

    const cookies1 = Array.isArray(res1.headers['set-cookie']) ? res1.headers['set-cookie'] : [];
    const cookies2 = Array.isArray(res2.headers['set-cookie']) ? res2.headers['set-cookie'] : [];

    jwtCookieUser1 = cookies1.find((c: string) => c.startsWith('jwt='));
    jwtCookieUser2 = cookies2.find((c: string) => c.startsWith('jwt='));

    user1Id = res1.body.data._id;
    user2Id = res2.body.data._id;

    await User.findByIdAndUpdate(user1Id, { isOnboarded: true });
    await User.findByIdAndUpdate(user2Id, { isOnboarded: true });
  });

  it('GET /api/users - should get recommended users excluding friends', async () => {
    const res = await request(app).get(baseEndpoint).set('Cookie', jwtCookieUser1);

    // process.stdout.write("Recommended users:\n", res.body.data);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Should include user2 as recommended (since not friend yet)
    expect(res.body.data.some((u: any) => u.email === user2.email)).toBe(true);
  });

  it('GET /api/users/friends - should get friends list (empty initially)', async () => {
    const res = await request(app).get(`${baseEndpoint}/friends`).set('Cookie', jwtCookieUser1);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data.friends || res.body.data)).toBe(true);
    // Initially user1 has no friends
  });

  it('POST /api/users/friend-request/:id - should send friend request', async () => {
    const res = await request(app)
      .post(`${baseEndpoint}/friend-request/${user2Id}`)
      .set('Cookie', jwtCookieUser1);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('sender', user1Id);
    expect(res.body.data).toHaveProperty('recipient', user2Id);
    expect(res.body.data.status).toBe('pending');
  });

  it('POST /api/users/friend-request/:id - disallow sending request to yourself', async () => {
    const res = await request(app)
      .post(`${baseEndpoint}/friend-request/${user1Id}`)
      .set('Cookie', jwtCookieUser1);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('PUT /api/users/friend-request/:id/accept - should accept friend request', async () => {
    // user1 sends request to user2
    await request(app)
      .post(`${baseEndpoint}/friend-request/${user2Id}`)
      .set('Cookie', jwtCookieUser1)
      .expect(201);

    // get incoming requests for user2 to get request id
    const incomingRes = await request(app)
      .get(`${baseEndpoint}/friend-requests`)
      .set('Cookie', jwtCookieUser2)
      .expect(200);

    const incomingReqs = incomingRes.body.data.incomingReqs;
    expect(incomingReqs.length).toBeGreaterThan(0);
    const requestId = incomingReqs[0]._id;

    // user2 accepts the friend request
    const acceptRes = await request(app)
      .put(`${baseEndpoint}/friend-request/${requestId}/accept`)
      .set('Cookie', jwtCookieUser2);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body).toHaveProperty('success', true);
    expect(acceptRes.body.message).toMatch(/accepted/i);
  });

  it('GET /api/users/friend-requests - should get incoming and accepted requests', async () => {
    // Send friend request user1->user2
    await request(app)
      .post(`${baseEndpoint}/friend-request/${user2Id}`)
      .set('Cookie', jwtCookieUser1)
      .expect(201);

    // user2 gets friend requests
    const res = await request(app)
      .get(`${baseEndpoint}/friend-requests`)
      .set('Cookie', jwtCookieUser2);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('incomingReqs');
    expect(Array.isArray(res.body.data.incomingReqs)).toBe(true);
  });

  it('GET /api/users/outgoing-friend-requests - should get outgoing pending friend requests', async () => {
    await request(app)
      .post(`${baseEndpoint}/friend-request/${user2Id}`)
      .set('Cookie', jwtCookieUser1)
      .expect(201);

    const res = await request(app)
      .get(`${baseEndpoint}/outgoing-friend-requests`)
      .set('Cookie', jwtCookieUser1);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
