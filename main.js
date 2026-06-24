import express from "express";
import configs from "./src/config/enviromentConfig.js";

import { redis } from "./src/db/redisConnection.js";

import { shortenUrl } from "./src/routes/shortenRoute.js";
import { redirectUrl } from "./src/routes/redirectRoute.js";
import { rateLimiter } from "./src/middlewares/rateLimiter.js";

const app = express();
let redirectLimiter = undefined;

try {
  await redis.connect();
  console.log("Connected to Redis");
  redirectLimiter = rateLimiter();
} catch (error) {
  console.error("Error connecting to Redis:", error);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/shorten", shortenUrl);
app.get("/:slug", redirectLimiter, redirectUrl);

app.listen(configs.appPort, () => {
  console.log(`Server is running on port ${configs.appPort}`);
});
