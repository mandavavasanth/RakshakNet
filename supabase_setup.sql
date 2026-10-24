-- ============================================================
-- RAKSHAKNET - SUPABASE DATABASE SETUP
-- ============================================================
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates all tables, indexes, RLS policies, and seed data
-- matching the FastAPI backend models.
--
-- RECEIVER FORMAT (Arduino Mega serial output):
--   ==============================
--   RAW PACKET: SOS,17.382100,78.510800
--   VALID ALERT PACKET
--   TYPE: SOS
--   LAT: 17.382100
--   LON: 78.510800
--   RSSI: -45
--   SNR: 12.50
--
-- TRANSMITTER FORMAT (LoRa packet):
--   SOS,17.382100,78.510800
-- ============================================================


-- ============================================================
-- 1. ALERTS TABLE
-- ============================================================
-- Stores LoRa distress alerts from field devices.
-- Includes GPS coordinates, LoRa signal quality (RSSI/SNR),
-- estimated accuracy, and rescue team assignment.
-- ============================================================

CREATE TABLE IF NOT EXISTS alerts (
    id              SERIAL PRIMARY KEY,
    "deviceId"      VARCHAR(255) NOT NULL,
    "helpType"      VARCHAR(50) NOT NULL,              -- SOS, Medical, Water, Food
    lat             DOUBLE PRECISION NOT NULL,
    lng             DOUBLE PRECISION NOT NULL,
    timestamp       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    rssi            INTEGER,                           -- LoRa RSSI in dBm (e.g. -45)
    snr             DOUBLE PRECISION,                  -- Signal-to-Noise Ratio in dB (e.g. 12.5)
    accuracy        DOUBLE PRECISION,                  -- Estimated GPS accuracy in meters
    status          VARCHAR(50) DEFAULT 'Pending',     -- Pending, Assigned, Completed
    "assignedTeam"  VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_alerts_device_id   ON alerts ("deviceId");
CREATE INDEX IF NOT EXISTS idx_alerts_help_type   ON alerts ("helpType");
CREATE INDEX IF NOT EXISTS idx_alerts_status      ON alerts (status);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp   ON alerts (timestamp DESC);


-- ============================================================
-- 2. RESCUE TEAMS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS rescue_teams (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    status      VARCHAR(50) DEFAULT 'Available',      -- Available, Deployed, Assigned
    members     INTEGER DEFAULT 4,
    vehicle     VARCHAR(255),
    "teamCode"  VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_rescue_teams_name   ON rescue_teams (name);
CREATE INDEX IF NOT EXISTS idx_rescue_teams_status ON rescue_teams (status);


-- ============================================================
-- 3. MISSIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS missions (
    id                      SERIAL PRIMARY KEY,
    "alertId"               INTEGER REFERENCES alerts(id) ON DELETE SET NULL,
    "teamName"              VARCHAR(255) NOT NULL,
    "missionCode"           VARCHAR(50),
    "helpType"              VARCHAR(50),
    status                  VARCHAR(50) DEFAULT 'Active',   -- Active, Completed, Aborted
    "startTime"             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "endTime"               TIMESTAMP WITH TIME ZONE,
    "responseTimeMinutes"   DOUBLE PRECISION,
    notes                   TEXT
);

CREATE INDEX IF NOT EXISTS idx_missions_alert_id  ON missions ("alertId");
CREATE INDEX IF NOT EXISTS idx_missions_status    ON missions (status);


-- ============================================================
-- 4. CHAT MESSAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id              SERIAL PRIMARY KEY,
    "senderId"      VARCHAR(255) NOT NULL,
    "senderName"    VARCHAR(255),
    message         TEXT NOT NULL,
    timestamp       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "alertId"       INTEGER,
    channel         VARCHAR(100) DEFAULT 'general'
);

CREATE INDEX IF NOT EXISTS idx_chat_channel   ON chat_messages (channel);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_messages (timestamp ASC);


-- ============================================================
-- 5. TEAM INVENTORY TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS team_inventory (
    id              SERIAL PRIMARY KEY,
    "teamId"        INTEGER NOT NULL REFERENCES rescue_teams(id) ON DELETE CASCADE,
    "itemName"      VARCHAR(255) NOT NULL,
    quantity        INTEGER DEFAULT 0,
    "lastUpdated"   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_team_id ON team_inventory ("teamId");


-- ============================================================
-- 6. AUDIT LOGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id          SERIAL PRIMARY KEY,
    action      VARCHAR(255) NOT NULL,
    timestamp   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "userId"    VARCHAR(255),
    details     TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp DESC);


-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to alerts"
    ON alerts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE rescue_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to rescue_teams"
    ON rescue_teams FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to missions"
    ON missions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to chat_messages"
    ON chat_messages FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE team_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to team_inventory"
    ON team_inventory FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to audit_logs"
    ON audit_logs FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- 8. SEED DATA
-- ============================================================

-- Rescue Teams
INSERT INTO rescue_teams (name, "teamCode", members, vehicle, status) VALUES
    ('Alpha Team',     'TEAM-01', 5, 'Heavy Rescue Truck',      'Assigned'),
    ('Bravo Squad',    'TEAM-02', 4, 'EOC Ambulance',           'Assigned'),
    ('Charlie Rescue', 'TEAM-03', 6, 'All-Terrain 4x4',         'Available'),
    ('Delta Support',  'TEAM-04', 4, 'Inflatable Boat Carrier',  'Available')
ON CONFLICT (name) DO NOTHING;

-- Alerts (Hyderabad area with LoRa signal quality)
INSERT INTO alerts ("deviceId", "helpType", lat, lng, rssi, snr, accuracy, status, "assignedTeam") VALUES
    ('DEV001', 'SOS',     17.3850, 78.4867, -45,  12.5, 3.2,  'Assigned',  'Alpha Team'),
    ('DEV002', 'Medical', 17.3910, 78.4900, -62,  9.8,  5.1,  'Assigned',  'Bravo Squad'),
    ('DEV003', 'Water',   17.3880, 78.4750, -78,  6.3,  8.7,  'Pending',   NULL),
    ('DEV004', 'Food',    17.3950, 78.4800, -55,  11.2, 4.0,  'Pending',   NULL),
    ('DEV005', 'Medical', 17.3980, 78.4950, -91,  3.1,  15.4, 'Pending',   NULL),
    ('DEV006', 'SOS',     17.4000, 78.4700, -38,  13.7, 2.5,  'Completed', NULL),
    ('DEV007', 'Water',   17.3820, 78.4980, -70,  7.9,  6.8,  'Completed', NULL);

-- Missions
INSERT INTO missions ("alertId", "teamName", "missionCode", "helpType", status, "startTime", "endTime", "responseTimeMinutes") VALUES
    (1, 'Alpha Team',     'MSN-001', 'SOS',     'Active',    NOW() - INTERVAL '45 minutes', NULL,  NULL),
    (2, 'Bravo Squad',    'MSN-002', 'Medical', 'Active',    NOW() - INTERVAL '30 minutes', NULL,  NULL),
    (6, 'Charlie Rescue', 'MSN-003', 'SOS',     'Completed', NOW() - INTERVAL '2 hours',    NOW(), 15.5);

-- Team Inventory
INSERT INTO team_inventory ("teamId", "itemName", quantity) VALUES
    (1, 'Medical Kits',   10),
    (1, 'Life Jackets',   5),
    (2, 'Medical Kits',   20),
    (3, 'Food Packets',   50),
    (4, 'Water Bottles',  100);

-- Chat Messages
INSERT INTO chat_messages ("senderId", "senderName", message, channel, "alertId") VALUES
    ('SYS',     'System',     'EOC activated.',                         'general', NULL),
    ('TEAM-01', 'Alpha Team', 'En route to location for DEV001 SOS.',  'general', 1);


-- ============================================================
-- DONE! Tables created:
--   1. alerts          (with rssi, snr, accuracy)
--   2. rescue_teams
--   3. missions
--   4. chat_messages
--   5. team_inventory
--   6. audit_logs
-- ============================================================
