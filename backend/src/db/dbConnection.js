import PG from "pg";
import configs from "../config/environmentConfig.js";

const { Pool } = PG;

const pool = new Pool({
  user: configs.dbUser,
  host: configs.dbHost,
  dbhost: configs.dbHost,
  database: configs.dbName,
  password: configs.dbPassword,
  port: configs.dbPort,
});

export default pool;
