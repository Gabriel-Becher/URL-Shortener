import rateLimit from "express-rate-limit";
import { redis } from "../db/redisConnection.js";
import { RedisStore } from "rate-limit-redis";

export const rateLimiter = (redisClient) =>
  rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // limit each IP to 100 requests per time window
    message: "Too many requests, please try again after an hour",
    standardHeaders: true,
  });
