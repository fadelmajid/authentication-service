-- Creation of product table
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL,
  user_name VARCHAR(200),
  user_username VARCHAR(100) UNIQUE,
  user_password TEXT,
  user_code VARCHAR(7),
  user_email VARCHAR(100),
  user_phone VARCHAR(50),
  user_identification_id VARCHAR(100),
  user_birthday TIMESTAMP,
  user_status VARCHAR(50),
  last_login TIMESTAMP,
  last_activity TIMESTAMP,
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  PRIMARY KEY (user_id)
);

-- Creation of product table
CREATE TABLE IF NOT EXISTS lock_transaction (
  lock_id SERIAL,
  lock_remarks text,
  updated_date TIMESTAMP,
  PRIMARY KEY (lock_id)
);

-- Creation of product table
CREATE TABLE IF NOT EXISTS auth_token (
  atoken_id SERIAL,
  user_id SERIAL,
  atoken_device VARCHAR(200),
  atoken_platform VARCHAR(200),
  atoken_access VARCHAR(200),
  atoken_status VARCHAR(10),
  atoken_refresh VARCHAR(200),
  expired_date TIMESTAMP,
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  PRIMARY KEY (atoken_id)
);

CREATE TABLE IF NOT EXISTS app_version (
  ver_id SERIAL,
  ver_code  VARCHAR(50) NOT NULL,
  ver_platform VARCHAR(50),
  ver_status VARCHAR(10),
  created_by INT NOT NULL,
  updated_by INT NOT NULL,
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  PRIMARY KEY (ver_id)
);

CREATE TABLE IF NOT EXISTS history_device (
  hd_id SERIAL,
  atoken_device  VARCHAR(200),
  atoken_platform VARCHAR(200),
  created_date TIMESTAMP,
  PRIMARY KEY (hd_id)
);