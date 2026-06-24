import { nanoid } from "nanoid";
import pool from "../db/dbConnection.js";
import { redis } from "../db/redisConnection.js";

const generateUniqueSlug = async () => {
  while (true) {
    const slug = nanoid(8);

    const result = await pool.query("SELECT 1 FROM urls WHERE slug = $1", [
      slug,
    ]);

    if (result.rows.length === 0) {
      return slug;
    }
  }
};

export const shortenUrl = async (req, res) => {
  const { url } = req.body;
  const slug = await generateUniqueSlug();

  //validate URL format
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    //verify existence
    const existingUrl = await pool.query(
      "SELECT * FROM urls WHERE original = $1",
      [url],
    );
    if (existingUrl.rows.length > 0) {
      return res.status(200).json({ slug: existingUrl.rows[0].slug });
    } else {
      //create new if not found
      const query =
        "INSERT INTO urls (slug, original) VALUES ($1, $2) RETURNING *";
      const values = [slug, url];
      const result = await pool.query(query, values);
      await redis.set(url, slug, {
        ex: 60 * 60 * 24 * 7,
      });
      res.status(201).json({ slug: result.rows[0].slug });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
