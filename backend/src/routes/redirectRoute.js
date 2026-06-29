import pool from "../db/dbConnection.js";
import { redis } from "../db/redisConnection.js";

export const redirectUrl = async (req, res) => {
  const slug = req.params.slug;
  if (!slug || !/^[a-zA-Z0-9_-]{8}$$/.test(slug)) {
    return res.status(400).json({ error: "Invalid slug format" });
  }
  try {
    //Try cache first
    const cachedUrl = await redis.get(slug);
    if (cachedUrl) {
      redis.incr(`clicks:${slug}`); // Increment clicks
      pool.query("INSERT INTO clicks (slug) VALUES ($1)", [slug]);
      return res.redirect(cachedUrl);
    }
    const query = "SELECT original FROM urls WHERE slug = $1";
    const values = [slug];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }
    //Store in cache for future requests
    await redis.set(slug, result.rows[0].original, {
      ex: 60 * 60 * 24 * 7,
    });
    redis.incr(`clicks:${slug}`);
    pool.query("INSERT INTO clicks (slug) VALUES ($1)", [slug]);
    res.redirect(result.rows[0].original);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
