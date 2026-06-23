import { nanoid } from "nanoid";
import pool from "../db/dbConnection.js";

export const redirectUrl = async (req, res) => {
  const slug = req.params.slug;
  try {
    const query = "SELECT original FROM urls WHERE slug = $1";
    const values = [slug];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }
    res.redirect(result.rows[0].original);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
