CREATE TABLE IF NOT EXISTS media_packs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT 'R$ 49',
  cover_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media_items (
  id TEXT PRIMARY KEY,
  pack_id TEXT NOT NULL,
  title TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (pack_id) REFERENCES media_packs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_items_pack_id ON media_items(pack_id);
