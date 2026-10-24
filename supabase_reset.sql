-- ============================================================
-- RAKSHAKNET - DROP ALL TABLES (RESET)
-- ============================================================
-- Run this BEFORE supabase_setup.sql if you need a clean slate.
-- WARNING: This will DELETE all data!
-- ============================================================

-- Drop policies first
DROP POLICY IF EXISTS "Allow all access to alerts"         ON alerts;
DROP POLICY IF EXISTS "Allow all access to rescue_teams"   ON rescue_teams;
DROP POLICY IF EXISTS "Allow all access to missions"       ON missions;
DROP POLICY IF EXISTS "Allow all access to chat_messages"  ON chat_messages;
DROP POLICY IF EXISTS "Allow all access to team_inventory" ON team_inventory;
DROP POLICY IF EXISTS "Allow all access to audit_logs"     ON audit_logs;

-- Drop tables in dependency order
DROP TABLE IF EXISTS team_inventory CASCADE;
DROP TABLE IF EXISTS missions       CASCADE;
DROP TABLE IF EXISTS chat_messages   CASCADE;
DROP TABLE IF EXISTS audit_logs      CASCADE;
DROP TABLE IF EXISTS alerts          CASCADE;
DROP TABLE IF EXISTS rescue_teams    CASCADE;

-- ============================================================
-- All tables dropped. Now run supabase_setup.sql to recreate.
-- ============================================================
