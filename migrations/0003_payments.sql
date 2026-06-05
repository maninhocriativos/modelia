CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  pack_id TEXT NOT NULL,
  pack_title TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL DEFAULT 0,
  provider TEXT NOT NULL DEFAULT 'asaas',
  provider_payment_id TEXT,
  provider_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  pix_payload TEXT NOT NULL DEFAULT '',
  pix_qr_image TEXT NOT NULL DEFAULT '',
  invoice_url TEXT NOT NULL DEFAULT '',
  external_reference TEXT NOT NULL DEFAULT '',
  raw_event TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payments_contact_id ON payments(contact_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
