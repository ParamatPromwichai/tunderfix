-- Additive migration. Apply after the existing ThunderFix schema.
CREATE TABLE IF NOT EXISTS urgent_dispatch (
  job_id BIGINT UNSIGNED PRIMARY KEY,
  radius_km INT UNSIGNED NOT NULL DEFAULT 10,
  expires_at DATETIME NOT NULL,
  INDEX idx_dispatch_expiry (expires_at),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS urgent_presence (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  online BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS urgent_offers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  technician_id BIGINT UNSIGNED NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  eta_minutes INT UNSIGNED NOT NULL,
  note VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_urgent_offer (job_id, technician_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
