-- 
-- MossZip Enterprise Central Database Schema
-- Run this script in Supabase SQL Editor (https://app.supabase.com -> SQL Editor)
--

-- 1. Create or Update compression_jobs Table
CREATE TABLE IF NOT EXISTS compression_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                                 -- Filename or job title
    file_name TEXT,                                     -- Alias for filename compatibility
    job_type TEXT NOT NULL DEFAULT 'Compress',         -- 'Compress', 'Image to PDF', 'PDF to Word', 'Merge PDF'
    original_bits BIGINT DEFAULT 0,                     -- Size before processing
    compressed_bits_count BIGINT DEFAULT 0,             -- Size after processing
    ratio NUMERIC(5,2) DEFAULT 0,                       -- Reduction ratio percentage
    original_text TEXT,                                 -- Source text preview
    compressed_bits TEXT,                               -- Bitstream representation
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,           -- Detailed JSON: { originalBits, compressedBits, ratio }
    frequency_map JSONB DEFAULT '{}'::jsonb,           
    huffman_codes JSONB DEFAULT '{}'::jsonb,           
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID DEFAULT auth.uid()                    -- Optional user ID
);

-- Ensure all columns exist for existing tables
ALTER TABLE compression_jobs ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE compression_jobs ADD COLUMN IF NOT EXISTS job_type TEXT DEFAULT 'Compress';
ALTER TABLE compression_jobs ADD COLUMN IF NOT EXISTS original_bits BIGINT DEFAULT 0;
ALTER TABLE compression_jobs ADD COLUMN IF NOT EXISTS compressed_bits_count BIGINT DEFAULT 0;
ALTER TABLE compression_jobs ADD COLUMN IF NOT EXISTS ratio NUMERIC(5,2) DEFAULT 0;
ALTER TABLE compression_jobs ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}'::jsonb;
ALTER TABLE compression_jobs ALTER COLUMN frequency_map DROP NOT NULL;
ALTER TABLE compression_jobs ALTER COLUMN huffman_codes DROP NOT NULL;

-- 2. Create audit_logs Table for Central Admin Sync
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT,
    ip TEXT,
    job_type TEXT NOT NULL DEFAULT 'Compress',
    file_name TEXT NOT NULL,
    original_bits BIGINT DEFAULT 0,
    compressed_bits BIGINT DEFAULT 0,
    ratio NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create app_users Table for Universal Multi-Device Auth Sync
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    mobile TEXT UNIQUE,
    email TEXT,
    mpin TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create sys_settings Table for Global Live Admin Limits & Configuration Sync
CREATE TABLE IF NOT EXISTS sys_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_compression_jobs_created_at ON compression_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_users_mobile ON app_users(mobile);

-- 6. Enable Row Level Security (RLS) & Grant Full Access Policies
ALTER TABLE compression_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_settings ENABLE ROW LEVEL SECURITY;

-- Drop old conflicting policies if present to prevent 42710 "already exists" errors
DROP POLICY IF EXISTS "Allow public read access" ON compression_jobs;
DROP POLICY IF EXISTS "Allow public insert access" ON compression_jobs;
DROP POLICY IF EXISTS "Allow public delete access" ON compression_jobs;
DROP POLICY IF EXISTS "Universal public select" ON compression_jobs;
DROP POLICY IF EXISTS "Universal public insert" ON compression_jobs;
DROP POLICY IF EXISTS "Universal public update" ON compression_jobs;
DROP POLICY IF EXISTS "Universal public delete" ON compression_jobs;

DROP POLICY IF EXISTS "Universal audit select" ON audit_logs;
DROP POLICY IF EXISTS "Universal audit insert" ON audit_logs;

DROP POLICY IF EXISTS "Universal users select" ON app_users;
DROP POLICY IF EXISTS "Universal users insert" ON app_users;
DROP POLICY IF EXISTS "Universal users update" ON app_users;

DROP POLICY IF EXISTS "Universal settings select" ON sys_settings;
DROP POLICY IF EXISTS "Universal settings upsert" ON sys_settings;

-- Universal RLS Policies for compression_jobs
CREATE POLICY "Universal public select" ON compression_jobs FOR SELECT USING (true);
CREATE POLICY "Universal public insert" ON compression_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Universal public update" ON compression_jobs FOR UPDATE USING (true);
CREATE POLICY "Universal public delete" ON compression_jobs FOR DELETE USING (true);

-- Universal RLS Policies for audit_logs
CREATE POLICY "Universal audit select" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Universal audit insert" ON audit_logs FOR INSERT WITH CHECK (true);

-- Universal RLS Policies for app_users
CREATE POLICY "Universal users select" ON app_users FOR SELECT USING (true);
CREATE POLICY "Universal users insert" ON app_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Universal users update" ON app_users FOR UPDATE USING (true);

-- Universal RLS Policies for sys_settings
CREATE POLICY "Universal settings select" ON sys_settings FOR SELECT USING (true);
CREATE POLICY "Universal settings upsert" ON sys_settings FOR ALL USING (true) WITH CHECK (true);
