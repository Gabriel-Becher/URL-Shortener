import { nanoid } from "nanoid";
import pool from "../db/dbConnection.js";

export const shortenUrl = async (req, res) => {
  const { url } = req.body;
  const slug = nanoid(8);

  try {
    const query =
      "INSERT INTO urls (slug, original) VALUES ($1, $2) RETURNING *";
    const values = [slug, url];
    const result = await pool.query(query, values);
    res.status(201).json({ slug: result.rows[0].slug });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
