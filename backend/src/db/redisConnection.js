import { createClient } from "redis";
import configs from "../config/environmentConfig.js";

export const redis = createClient({
  url: `redis://${configs.redisHost}:${configs.redisPort}`,
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});
