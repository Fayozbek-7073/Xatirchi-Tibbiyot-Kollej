-- Migration: 001_init
-- Creates all base tables for Xatirchi-tibbiyot.uz

BEGIN;

-- Users (admin / director)
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'director')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Faculties (yo'nalishlar)
CREATE TABLE IF NOT EXISTS faculties (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  faculty_id INTEGER NOT NULL REFERENCES faculties(id) ON DELETE RESTRICT,
  course     SMALLINT NOT NULL CHECK (course BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, faculty_id)
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id             SERIAL PRIMARY KEY,
  full_name      VARCHAR(255) NOT NULL,
  group_id       INTEGER NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
  contract_total NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (contract_total >= 0),
  contract_paid  NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (contract_paid >= 0),
  debt           NUMERIC(15, 2) GENERATED ALWAYS AS (contract_total - contract_paid) STORED,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment log (audit trail)
CREATE TABLE IF NOT EXISTS payments (
  id         SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  amount     NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  note       TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at via trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['users', 'faculties', 'groups', 'students'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
       CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;

COMMIT;
