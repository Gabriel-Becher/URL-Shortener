import pool from "../db/dbConnection.js";
import { redis } from "../db/redisConnection.js";

export const getAnalytics = async (req, res) => {
  const slug = req.params.slug;
  let result = undefined;
  if (slug && slug.length !== 8) {
    return res.status(400).json({ error: "Invalid slug format" });
  }

  try {
    if (!slug) {
      // Fetch all analytics only from the database.
      result = await pool.query(
        "SELECT slug, total_clicks FROM urls ORDER BY total_clicks DESC",
      );
    } else {
      //For precise information sync first then retrieve analytics
      const redis_clicks = await redis.get(`clicks:${slug}`);
      if (redis_clicks !== null) {
        result = await pool.query(
          "UPDATE urls SET total_clicks = total_clicks + $1 WHERE slug = $2 RETURNING total_clicks",
          [redis_clicks, slug],
        );
        await redis.del(`clicks:${slug}`);
      } else {
        result = await pool.query(
          "SELECT slug, total_clicks FROM urls WHERE slug = $1",
          [slug],
        );
      }
    }
    if (result?.rows.length === 0) {
      return res.status(404).json({ error: "Slug not found" });
    }
    res
      .status(200)
      .json(result.rows.length > 0 && !slug ? result.rows : result.rows[0]);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
