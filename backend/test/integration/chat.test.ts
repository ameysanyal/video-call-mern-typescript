import request from "supertest";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import app from "../../src/app.js";

// --- MOCKS ---

// Mock protectRoute so it just attaches a fake user
vi.mock("../../src/middlewares/auth.middleware.js", () => ({
  protectRoute: (req: any, _res: any, next: any) => {
    req.user = { id: "mockUserId", _id: new mongoose.Types.ObjectId() };
    next();
  },
}));

// Mock generateStreamToken so it returns a fake token
vi.mock("../../src/lib/streamChat.js", () => ({
  generateStreamToken: vi.fn(() => "mocked-stream-token"),
}));

// --- TESTS ---
describe("Chat Route Integration", () => {
  beforeAll(async () => {
    // Connect to test DB (if needed for this route)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI as string);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should return stream token when user is authenticated", async () => {
    const res = await request(app)
      .get("/api/chat/token") // The route you defined
      .expect(200);

    expect(res.body).toMatchObject({
      success: true,
      data: "mocked-stream-token",
    });
  });
});
