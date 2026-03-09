DROP TABLE IF EXISTS operator CASCADE;
DROP TABLE IF EXISTS aircraft CASCADE;
DROP TABLE IF EXISTS certification CASCADE;
DROP TABLE IF EXISTS pilot_license CASCADE;
DROP TABLE IF EXISTS insurance CASCADE;
DROP TABLE IF EXISTS operation CASCADE;
DROP TABLE IF EXISTS pilot CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

CREATE TABLE operator (
   operator_id SERIAL PRIMARY KEY,
   first_name VARCHAR(150) NOT NULL,
   last_name VARCHAR(150) NOT NULL,
   fiscal_id INTEGER,
   operator_number INTEGER,
   secret_code_rid INTEGER,
   easa_certificate_path TEXT,
   non_easa_certificate_path TEXT,
   address VARCHAR(255),
   postal_code INTEGER,
   city VARCHAR(150),
   province VARCHAR(150),
   email VARCHAR(150),
   phone_number BIGINT
);

CREATE TABLE app_user (
   user_id SERIAL PRIMARY KEY,
   operator_id INTEGER NOT NULL,
   first_name VARCHAR(100),
   last_name VARCHAR(150),
   username VARCHAR(100) UNIQUE,
   password TEXT NOT NULL,
   email VARCHAR(150) UNIQUE,
   phone_number BIGINT,
   image_path TEXT
);

CREATE TABLE pilot (
   pilot_id SERIAL PRIMARY KEY,
   operator_id INTEGER NOT NULL,
   user_id INTEGER UNIQUE
);

CREATE TABLE certification (
   certification_id SERIAL PRIMARY KEY,
   name VARCHAR(150) NOT NULL,
   type VARCHAR(100)
);

CREATE TABLE pilot_license (
   pilot_id INTEGER NOT NULL,
   certification_id INTEGER NOT NULL,
   start_date DATE,
   expiry_date DATE,
   PRIMARY KEY (pilot_id, certification_id)
);

CREATE TABLE insurance (
   insurance_id SERIAL PRIMARY KEY,
   name VARCHAR(150) NOT NULL,
   start_date DATE,
   expiry_date DATE,
   amount BIGINT
);

CREATE TABLE aircraft (
   aircraft_id SERIAL PRIMARY KEY,
   operator_id INTEGER NOT NULL,
   insurance_id INTEGER,
   name VARCHAR(150),
   serial_number INTEGER,
   status VARCHAR(100),
   manufacturer VARCHAR(150),
   model VARCHAR(150),
   image_path TEXT,
   purchase_date DATE
);

CREATE TABLE operation (
   operation_id SERIAL PRIMARY KEY,
   pilot_id INTEGER NOT NULL,
   aircraft_id INTEGER NOT NULL,
   execution_date DATE,
   status VARCHAR(100),
   category VARCHAR(100)
);

ALTER TABLE app_user ADD FOREIGN KEY (operator_id) REFERENCES operator(operator_id) ON DELETE CASCADE;

ALTER TABLE pilot ADD FOREIGN KEY (operator_id) REFERENCES operator(operator_id) ON DELETE CASCADE;
ALTER TABLE pilot ADD FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE;

ALTER TABLE pilot_license ADD FOREIGN KEY (pilot_id) REFERENCES pilot(pilot_id) ON DELETE CASCADE;
ALTER TABLE pilot_license ADD FOREIGN KEY (certification_id) REFERENCES certification(certification_id) ON DELETE CASCADE;

ALTER TABLE aircraft ADD FOREIGN KEY (operator_id) REFERENCES operator(operator_id) ON DELETE CASCADE;
ALTER TABLE aircraft ADD FOREIGN KEY (insurance_id) REFERENCES insurance(insurance_id) ON DELETE CASCADE;

ALTER TABLE operation ADD FOREIGN KEY (pilot_id) REFERENCES pilot(pilot_id) ON DELETE CASCADE;
ALTER TABLE aircraft ADD FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id) ON DELETE CASCADE;

\dt