import { nanoid } from "nanoid";
import pool from "../db/dbConnection.js";
import { redis } from "../db/redisConnection.js";

export const redirectUrl = async (req, res) => {
  const slug = req.params.slug;
  try {
    //Try cache first
    const cachedUrl = await redis.get(slug);
    if (cachedUrl) {
      return res.redirect(cachedUrl);
    }
    const query = "SELECT original FROM urls WHERE slug = $1";
    const values = [slug];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }
    //Store in cache for future requests
    await redis.set(slug, result.rows[0].original, "EX", 60 * 60 * 24 * 1); //Less time than creation
    res.redirect(result.rows[0].original);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
