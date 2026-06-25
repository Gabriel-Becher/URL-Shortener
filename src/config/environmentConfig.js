import { loadEnvFile } from "node:process";

loadEnvFile("./.env");

const configs = {
  appPort: process.env.PORT || 3000,
  appHost: process.env.HOST || "localhost",
  dbHost: process.env.DB_HOST || "localhost",
  dbUser: process.env.POSTGRES_USER || "",
  dbPassword: process.env.POSTGRES_PASSWORD || "",
  dbName: process.env.POSTGRES_DB || "",
  dbPort: process.env.POSTGRES_PORT || 5432,
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: process.env.REDIS_PORT || 6379,
};

export default configs;
