import poll from "../db/dbConnection.js";
import { redis } from "../db/redisConnection.js";

export const startCronJob = (redisClient) => {
  setInterval(async () => {
    try {
      const keys = await redisClient.keys("clicks:*");

      for (const key of keys) {
        const slug = key.split(":")[1];
        const clicks = await redisClient.get(key);
        await poll.query(
          "UPDATE urls SET total_clicks = total_clicks + $1 WHERE slug = $2",
          [clicks, slug],
        );
        await redisClient.del(key);
      }
      if (keys.length > 0) {
        console.log(
          `Synced click counts for ${keys.length} slugs to the database.`,
        );
      }
    } catch (error) {
      console.error("Error syncing click counts:", error);
    }
  }, 60000);
};
