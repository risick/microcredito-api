import dotenv from "dotenv"

dotenv.config()

export const config = {
  port: Number.parseInt(process.env.PORT || "3333", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  bcryptRounds: Number.parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  rateLimitWindowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  rateLimitMaxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
}
