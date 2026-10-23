-- ============================================================
-- Simple Technician Finder Database
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS technician_finder_simple
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE technician_finder_simple;

-- 1. ผู้ใช้ทุกประเภท: customer, technician, admin
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'technician', 'admin') NOT NULL DEFAULT 'customer',
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  avatar_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- 2. ข้อมูลเพิ่มเติมของช่าง
CREATE TABLE IF NOT EXISTS technician_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  bio TEXT NULL,
  years_experience TINYINT UNSIGNED NOT NULL DEFAULT 0,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  service_radius_km DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  verification_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  total_reviews INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_technician_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_technician_rating
    CHECK (average_rating >= 0 AND average_rating <= 5),
  INDEX idx_technician_location (latitude, longitude),
  INDEX idx_technician_search (verification_status, is_available)
) ENGINE=InnoDB;

-- 3. ประเภทงานบริการ
CREATE TABLE IF NOT EXISTS service_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. ประเภทบริการที่ช่างรับทำ
CREATE TABLE IF NOT EXISTS technician_services (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  technician_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  description TEXT NULL,
  price_min DECIMAL(10,2) NULL,
  price_max DECIMAL(10,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_technician_services_technician
    FOREIGN KEY (technician_id) REFERENCES technician_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_technician_services_category
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT,
  CONSTRAINT uq_technician_service UNIQUE (technician_id, category_id),
  CONSTRAINT chk_service_price CHECK (
    (price_min IS NULL OR price_min >= 0) AND
    (price_max IS NULL OR price_max >= 0) AND
    (price_min IS NULL OR price_max IS NULL OR price_max >= price_min)
  ),
  INDEX idx_services_category (category_id),
  INDEX idx_services_technician (technician_id)
) ENGINE=InnoDB;

-- 5. งานซ่อมที่ลูกค้าสร้าง
CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  technician_id BIGINT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  address_text TEXT NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  budget_min DECIMAL(10,2) NULL,
  budget_max DECIMAL(10,2) NULL,
  preferred_date DATE NULL,
  preferred_time TIME NULL,
  status ENUM(
    'requested',
    'accepted',
    'on_the_way',
    'in_progress',
    'completed',
    'cancelled'
  ) NOT NULL DEFAULT 'requested',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_customer
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_jobs_category
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_jobs_technician
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_job_budget CHECK (
    (budget_min IS NULL OR budget_min >= 0) AND
    (budget_max IS NULL OR budget_max >= 0) AND
    (budget_min IS NULL OR budget_max IS NULL OR budget_max >= budget_min)
  ),
  INDEX idx_jobs_customer_status (customer_id, status),
  INDEX idx_jobs_technician_status (technician_id, status),
  INDEX idx_jobs_location (latitude, longitude)
) ENGINE=InnoDB;

-- 6. คำขอที่ส่งไปให้ช่าง
CREATE TABLE IF NOT EXISTS job_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  technician_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  message TEXT NULL,
  quoted_price DECIMAL(10,2) NULL,
  responded_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_requests_job
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_job_requests_technician
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT uq_job_technician UNIQUE (job_id, technician_id),
  CONSTRAINT chk_quoted_price CHECK (quoted_price IS NULL OR quoted_price >= 0),
  INDEX idx_job_requests_technician (technician_id, status),
  INDEX idx_job_requests_job (job_id, status)
) ENGINE=InnoDB;

-- 7. ห้องแชตของลูกค้ากับช่างในแต่ละงาน
CREATE TABLE IF NOT EXISTS chat_rooms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  technician_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_rooms_job
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_rooms_customer
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_chat_rooms_technician
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT uq_chat_room UNIQUE (job_id, customer_id, technician_id),
  INDEX idx_chat_rooms_customer (customer_id),
  INDEX idx_chat_rooms_technician (technician_id)
) ENGINE=InnoDB;

-- 8. ข้อความในห้องแชต
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  attachment_url VARCHAR(500) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_messages_room
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_chat_messages_room (room_id, created_at)
) ENGINE=InnoDB;

-- 9. รีวิวหลังงานเสร็จ
CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  technician_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_job
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_customer
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reviews_technician
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT uq_review_per_job UNIQUE (job_id),
  CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_reviews_technician (technician_id)
) ENGINE=InnoDB;

-- 10. การแจ้งเตือน
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  related_job_id BIGINT UNSIGNED NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_job
    FOREIGN KEY (related_job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id, is_read, created_at)
) ENGINE=InnoDB;

-- ข้อมูลประเภทบริการเริ่มต้น
INSERT IGNORE INTO service_categories (name, description) VALUES
  ('ซ่อมแอร์', 'ติดตั้ง ล้าง และซ่อมเครื่องปรับอากาศ'),
  ('ซ่อมไฟฟ้า', 'ซ่อมปลั๊กไฟ สายไฟ และระบบไฟฟ้า'),
  ('ซ่อมประปา', 'ซ่อมท่อน้ำ ก๊อกน้ำ และระบบประปา'),
  ('ซ่อมมือถือ', 'ซ่อมโทรศัพท์ เปลี่ยนจอ และเปลี่ยนแบตเตอรี่'),
  ('ซ่อมคอมพิวเตอร์', 'ซ่อมและอัปเกรดคอมพิวเตอร์'),
  ('ช่างก่อสร้าง', 'งานปูน งานกระเบื้อง และงานต่อเติม');

