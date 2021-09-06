-- Creation of product table
CREATE TABLE IF NOT EXISTS customer (
  customer_id SERIAL,
  customer_name VARCHAR(200),
  customer_username VARCHAR(100) UNIQUE,
  customer_password TEXT,
  customer_code VARCHAR(7),
  customer_email VARCHAR(100),
  customer_phone VARCHAR(50),
  customer_identification_id VARCHAR(100),
  customer_birthday TIMESTAMP,
  customer_status VARCHAR(50),
  last_login TIMESTAMP,
  last_activity TIMESTAMP,
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  PRIMARY KEY (customer_id)
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
  customer_id SERIAL,
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


-- Creation of product table
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

-- Creation of product table
CREATE TABLE IF NOT EXISTS history_device (
  hd_id SERIAL,
  atoken_device  VARCHAR(200),
  atoken_platform VARCHAR(200),
  created_date TIMESTAMP,
  PRIMARY KEY (hd_id)
);

CREATE TABLE IF NOT EXISTS customer_account (
  customer_account_id SERIAL,
  customer_id SERIAL,
  customer_account_number VARCHAR(100) UNIQUE,
  customer_account_name VARCHAR(100),
  customer_account_balance INT,
  customer_account_status BOOLEAN NOT NULL DEFAULT TRUE,
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  PRIMARY KEY (customer_account_id)
);

CREATE TABLE IF NOT EXISTS customer_account_directory (
  customer_account_directory_id SERIAL,
  customer_id SERIAL,
  customer_account_id INT NOT NULL,
  customer_account_directory_name VARCHAR(100),
  customer_account_directory_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  PRIMARY KEY (customer_account_directory_id)
);

CREATE TABLE IF NOT EXISTS customer_transaction (
  customer_transaction_id SERIAL,
  customer_id_from SERIAL,
  customer_id_to SERIAL,
  customer_transaction_type VARCHAR(50),
  customer_transaction_amount INT,
  customer_transaction_notes VARCHAR(255),
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  PRIMARY KEY (customer_transaction_id)
);
