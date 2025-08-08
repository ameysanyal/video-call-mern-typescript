import { getEnv } from "@/utils/get-env.js";

const envConfig = () => ({
  PORT: getEnv("PORT", "5000"),
  MONGO_URI: getEnv("MONGO_URI", "MongoURI"),
  STREAM_API_KEY: getEnv("STEAM_API_KEY", "steamapi"),
  STREAM_API_SECRET: getEnv("STEAM_API_SECRET", "steamapisecret"),
  JWT_SECRET_KEY: getEnv("JWT_SECRET_KEY", "jwt-secret"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "10d"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
});

export const Env = envConfig();
