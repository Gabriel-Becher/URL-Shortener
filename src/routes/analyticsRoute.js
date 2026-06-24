import poll from "../db/dbConnection.js";

export const getAnalytics = async (req, res) => {
  const slug = req.params.slug;
  let result = undefined;
  if (slug && slug.length !== 8) {
    return res.status(400).json({ error: "Invalid slug format" });
  }

  try {
    if (!slug) {
      result = await poll.query(
        "SELECT slug, total_clicks FROM urls ORDER BY total_clicks DESC",
      );
    } else {
      result = await poll.query(
        "SELECT slug, total_clicks FROM urls WHERE slug = $1",
        [slug],
      );
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
