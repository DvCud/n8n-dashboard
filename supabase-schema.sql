-- ============================================================
-- Supabase Database Schema for n8n Workflow Dashboard
-- Run this in Supabase SQL Editor to set up your database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: workflows
-- Caches workflow metadata fetched from GitHub
-- ============================================================
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  node_count INTEGER DEFAULT 0,
  node_types TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'other',
  github_url TEXT,
  raw_url TEXT,
  size INTEGER DEFAULT 0,
  sha TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_updated ON workflows(updated_at);

-- ============================================================
-- Table: analytics
-- Tracks user interactions with workflows
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workflow_id TEXT REFERENCES workflows(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'download')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_workflow ON analytics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(created_at);

-- ============================================================
-- Function: Update timestamp on row update
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workflows table
DROP TRIGGER IF EXISTS workflows_updated_at ON workflows;
CREATE TRIGGER workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for workflows
CREATE POLICY "Public can read workflows" ON workflows
  FOR SELECT TO anon
  USING (true);

-- Public insert access for analytics (for tracking)
CREATE POLICY "Public can insert analytics" ON analytics
  FOR INSERT TO anon
  WITH CHECK (true);

-- Public read access for analytics
CREATE POLICY "Public can read analytics" ON analytics
  FOR SELECT TO anon
  USING (true);

-- ============================================================
-- Sample data (optional, for testing)
-- ============================================================
-- INSERT INTO workflows (id, name, description, node_count, category, github_url)
-- VALUES 
--   ('test-1', 'Test Workflow', 'A test workflow for development', 5, 'ai', 'https://github.com/example');
