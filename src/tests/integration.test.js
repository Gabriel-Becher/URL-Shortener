import request from "supertest";
import { app } from "../../main.js";
import pool from "../../src/db/dbConnection.js";
import { redis } from "../../src/db/redisConnection.js";

if (process.env.ALLOW_TESTS !== "true") {
  throw new Error(
    "Cannot run tests. Set ALLOW_TESTS=true in .env to allow tests to run.",
  );
}

afterAll(async () => {
  await pool.end();
  await redis.quit();
});

beforeEach(async () => {
  await pool.query("DELETE FROM clicks");
  await pool.query("DELETE FROM urls");
  await redis.flushDb();
});

describe("POST /shorten", () => {
  it("returns a shortened URL", async () => {
    const res = await request(app)
      .post("/shorten")
      .send({ url: "https://google.com" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("slug");
    expect(res.body.slug).toHaveLength(8);
  });

  it("returns the same slug for an existing URL", async () => {
    const first = await request(app)
      .post("/shorten")
      .send({ url: "https://google.com" });

    const second = await request(app)
      .post("/shorten")
      .send({ url: "https://google.com" });

    expect(second.status).toBe(200);
    expect(second.body.slug).toBe(first.body.slug);
  });

  it("returns 400 for invalid URL", async () => {
    const res = await request(app)
      .post("/shorten")
      .send({ url: "nao-e-uma-url" });

    expect(res.status).toBe(400);
  });
});

describe("GET /:slug", () => {
  it("redirects to the original URL", async () => {
    const { body } = await request(app)
      .post("/shorten")
      .send({ url: "https://google.com" });

    const res = await request(app).get(`/${body.slug}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://google.com");
  });

  it("returns 404 for non-existent slug", async () => {
    const res = await request(app).get("/slug1234");

    expect(res.status).toBe(404);
  });

  it("returns 400 for slug with invalid format", async () => {
    const res = await request(app).get("/abc");

    expect(res.status).toBe(400);
  });
});

describe("GET /analytics/:slug", () => {
  it("returns updated total_clicks after redirect", async () => {
    const { body } = await request(app)
      .post("/shorten")
      .send({ url: "https://google.com" });

    await request(app).get(`/${body.slug}`);
    await request(app).get(`/${body.slug}`);

    const res = await request(app).get(`/analytics/${body.slug}`);

    expect(res.status).toBe(200);
    expect(res.body.total_clicks).toBe(2);
  });

  it("returns 404 for non-existent slug", async () => {
    const res = await request(app).get("/analytics/slug1234");

    expect(res.status).toBe(404);
  });
});
