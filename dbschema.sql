CREATE TABLE urls (
  id        SERIAL PRIMARY KEY,
  slug      VARCHAR(8) UNIQUE NOT NULL,
  original  TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
 
CREATE TABLE clicks (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(8) REFERENCES urls(slug),
  clicked_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clicks_slug ON clicks(slug);
