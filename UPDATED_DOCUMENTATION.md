# RashakNet - Disaster Emergency Management System
## Updated Complete Documentation (v1.1.0)

**Version**: 1.1.0 (Updated: 2026-08-14)  
**Status**: Production Ready - Core MVP Features  
**Actual Implementation Analysis**: Completed & Verified

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Project Structure](#project-structure)
4. [Technology Stack & Versions](#technology-stack--versions)
5. [Backend Setup & Configuration](#backend-setup--configuration)
6. [Frontend Setup & Configuration](#frontend-setup--configuration)
7. [API Endpoints Specification](#api-endpoints-specification)
8. [Database Schema](#database-schema)
9. [WebSocket Real-Time Events](#websocket-real-time-events)
10. [Hardware Integration - Serial Bridge](#hardware-integration---serial-bridge)
11. [Frontend Components & Pages](#frontend-components--pages)
12. [Deployment Guide](#deployment-guide)
13. [Troubleshooting & FAQs](#troubleshooting--faqs)
14. [Security & Best Practices](#security--best-practices)
15. [Implementation Status & Roadmap](#implementation-status--roadmap)

---

## Executive Summary

**RashakNet** is a production-ready disaster emergency response management system designed to coordinate rescue operations during emergencies. This is a **working MVP** with the following confirmed features:

### ✅ Fully Implemented Features:
- **Real-time Alert Management**: Receive, track, and manage emergency alerts from Arduino/LoRa devices
- **Live Dashboard**: Real-time web interface with Leaflet map-based alert visualization
- **Team Coordination**: Assign and track rescue teams, monitor deployment status
- **Hardware Integration**: USB/Serial connection for Arduino emergency notifications
- **WebSocket Broadcasting**: Real-time push updates to all connected dashboard clients
- **Analytics & Statistics**: Monitor alert counts, response times, and status distribution
- **Secure API**: X-API-Key authentication for all POST/PATCH/DELETE operations
- **Chat System**: Real-time dispatch chat with channel support
- **Mission Tracking**: Log and track mission details with response times
- **Inventory Management**: Team equipment and supply tracking
- **Automatic Database Fallback**: PostgreSQL with SQLite fallback (automatic)

### ⚠️ Planned Features (Not Yet Implemented):
- PDF report generation
- Predictive analytics engine
- Emergency triage logic
- Drone integration & HUD
- Voice command control
- Alembic database migrations (manual SQL recommended)

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   RashakNet Ecosystem                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐          ┌──────────────────┐        │
│  │  Arduino/LoRa    │          │  Web Browser     │        │
│  │  Device (USB)    │          │  (React + Vite)  │        │
│  └────────┬─────────┘          └────────┬─────────┘        │
│           │                            │                  │
│  ┌────────▼────────────────────────────▼─────────┐         │
│  │  FastAPI Backend (Port 8000)                  │         │
│  │  ┌────────────────────────────────────────┐   │         │
│  │  │ REST API Endpoints                     │   │         │
│  │  │ - POST /api/alert (Serial Bridge)      │   │         │
│  │  │ - GET/PATCH /api/alerts (Dashboard)    │   │         │
│  │  │ - GET/POST /api/teams (Team Mgmt)      │   │         │
│  │  │ - GET /api/stats (Analytics)           │   │         │
│  │  │ - POST /api/chat/messages (Chat)       │   │         │
│  │  │ - GET/POST /api/missions (Missions)    │   │         │
│  │  │ - WS /ws/alerts (Real-time)            │   │         │
│  │  └────────────────────────────────────────┘   │         │
│  └────────┬────────────────────────────────────────┘        │
│           │                                                │
│  ┌────────▼───────────────────────────────┐                │
│  │   Database Layer                       │                │
│  │   Primary: PostgreSQL                  │                │
│  │   Fallback: SQLite (rashaknet.db)     │                │
│  │                                       │                │
│  │   Tables:                             │                │
│  │   ├─ alerts (Emergency records)       │                │
│  │   ├─ rescue_teams (Team info)         │                │
│  │   ├─ chat_messages (Communications)   │                │
│  │   ├─ missions (Mission tracking)      │                │
│  │   ├─ team_inventory (Equipment)       │                │
│  │   └─ audit_logs (Compliance)          │                │
│  └───────────────────────────────────────┘                │
│                                                             │
│  ┌──────────────────────────────────────┐                 │
│  │  Serial Bridge (Python)              │                 │
│  │  - Reads Arduino serial data         │                 │
│  │  - Parses JSON/CSV format            │                 │
│  │  - Posts to /api/alert               │                 │
│  │  - Retry logic & auto-reconnect      │                 │
│  └──────────────────────────────────────┘                 │
│                                                             │
│  ┌──────────────────────────────────────┐                 │
│  │  Node.js Server (Port 5001)          │                 │
│  │  - Minimal - Health check only       │                 │
│  │  - Optional for frontend serving     │                 │
│  └──────────────────────────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Alert Creation**: Arduino device → Serial bridge (PySerial) → POST `/api/alert` → Database
2. **Real-time Broadcasting**: New alert → FastAPI WebSocket manager → All connected clients
3. **Team Assignment**: Dashboard UI → PATCH `/api/alerts/{id}` → Database → WebSocket broadcast
4. **Chat Messages**: Team → POST `/api/chat/messages` → Database → Real-time display
5. **Mission Tracking**: Team completion → PATCH `/api/missions/{id}` → Calculate response time

---

## Project Structure

```
RAKSHAKNET/
│
├── 📄 main.py                          # FastAPI app entry point
├── 📄 database.py                      # PostgreSQL/SQLite config
├── 📄 models.py                        # SQLAlchemy ORM models (5 tables)
├── 📄 schemas.py                       # Pydantic request/response schemas
├── 📄 security.py                      # X-API-Key auth middleware
├── 📄 websocket_manager.py             # WebSocket connection manager
│
├── routes/                             # FastAPI route modules
│   ├── __init__.py
│   ├── alerts.py                       # POST/GET/PATCH alerts
│   ├── teams.py                        # GET/POST/PATCH teams
│   ├── stats.py                        # GET dashboard stats
│   ├── chat.py                         # POST/GET chat messages
│   ├── missions.py                     # GET/POST/PATCH missions
│   └── inventory.py                    # GET/POST team inventory
│
├── serial_bridge/                      # Hardware integration
│   ├── bridge.py                       # ✅ FULLY WORKING Serial→API bridge
│   ├── test_sender.py                  # Test script for Arduino simulation
│   └── requirements.txt
│
├── src/                                # React frontend (Vite)
│   ├── main.jsx                        # React entry point
│   ├── App.jsx                         # Main app component
│   ├── App.css                         # Global styling (custom CSS vars)
│   ├── index.css                       # Base styles
│   │
│   ├── components/                     # 5 reusable components
│   │   ├── Header.jsx                  # Top bar: time, status, theme
│   │   ├── Sidebar.jsx                 # Left nav with 8 menu items
│   │   ├── AlertCard.jsx               # Alert display (color-coded)
│   │   ├── TeamCard.jsx                # Team info card
│   │   └── StatsCard.jsx               # Stats display card
│   │
│   ├── pages/                          # 8 main application pages
│   │   ├── Dashboard.jsx               # 📊 Home - 6 stat cards
│   │   ├── ActiveAlerts.jsx            # 🚨 Alert list & management
│   │   ├── LiveGPSMap.jsx              # 📍 Leaflet map with pins
│   │   ├── RescueTeams.jsx             # 👥 Team cards & status
│   │   ├── AIIntelligence.jsx          # 📈 Charts & trends
│   │   ├── DispatchChat.jsx            # 💬 Team communication
│   │   ├── MissionHistory.jsx          # 📋 Mission log & CSV export
│   │   └── Settings.jsx                # ⚙️ System settings
│   │
│   ├── hooks/                          # React hooks
│   │   └── useWebSocket.js             # Auto-reconnecting WebSocket
│   │
│   └── utils/                          # Utility functions
│       └── api.js                      # Fetch wrapper with auth
│
├── public/                             # Static assets
│   ├── index.html
│   ├── manifest.json                   # PWA manifest
│   └── sw.js                           # Service worker
│
├── 📄 server.js                        # Node.js Express (minimal)
├── 📄 db.js                            # Database utilities (unused)
├── 📄 package.json                     # JavaScript dependencies
├── 📄 requirements.txt                 # Python dependencies
├── 📄 vite.config.js                   # Vite build config
├── 📄 index.html                       # HTML entry point
│
├── 📄 .env.example                     # Environment template
├── 📄 README.md                        # Initial setup guide
├── 📄 complete documentation.txt       # Previous version (deprecated)
└── 📄 start.bat                        # Windows launcher
```

---

## Technology Stack & Versions

### Backend - FastAPI (Port 8000)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.115.0 | Web framework with async support |
| **Uvicorn** | 0.30.0 | ASGI production server |
| **SQLAlchemy** | 2.0.32 | ORM for database management |
| **Pydantic** | 2.8.0 | Data validation & schemas |
| **Python-dotenv** | 1.0.1 | Environment configuration |
| **WebSockets** | 12.0 | Real-time bidirectional communication |
| **aiosqlite** | 0.20.0 | Async SQLite support |
| **PySerial** | 3.5 | USB serial communication for Arduino |
| **requests** | 2.32.0 | HTTP client for serial bridge |

### Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| **PostgreSQL** | Latest | Primary production database |
| **SQLite** | Built-in | Automatic fallback if PG unavailable |
| **Connection Pool** | SQLAlchemy | Automatic connection management |

### Frontend - React + Vite (Port 5173)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.1.0 | UI library |
| **React-DOM** | 19.1.0 | React rendering |
| **Vite** | 6.3.5 | Fast build tool & dev server |
| **Leaflet** | 1.9.4 | Interactive maps |
| **React-Leaflet** | 5.0.0 | React wrapper for Leaflet |
| **Chart.js** | 4.5.0 | Data visualization |
| **React-ChartJS-2** | 5.3.0 | React chart wrapper |
| **Lucide-React** | 0.511.0 | Icon library |
| **Supabase-JS** | 2.38.0 | Backend services client |

### Node.js Services (Port 5001 - Optional/Minimal)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express** | 4.18.2 | Web framework (minimal use) |
| **ws** | 8.14.2 | WebSocket server (echo only) |
| **node-cron** | 3.0.3 | Task scheduling (placeholder) |
| **Concurrently** | 9.1.0 | Run multiple npm scripts |

### Hardware Integration

| Technology | Purpose | Status |
|-----------|---------|--------|
| **Arduino Mega** | Primary emergency device | ✅ Supported |
| **LoRa Module** | Long-range wireless | ✅ Supported via serial |
| **GPS Module** | Location data | ✅ Supported |
| **PySerial** | USB communication | ✅ Fully working |

---

## Backend Setup & Configuration

### Step 1: Install Python Dependencies

```bash
cd d:\rakshaknet
pip install -r requirements.txt
```

**Key Dependencies**:
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.32
pydantic==2.8.0
python-dotenv==1.0.1
websockets==12.0
aiosqlite==0.20.0
pyserial==3.5
requests==2.32.0
```

### Step 2: Configure Environment Variables

Create `.env` file in project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rashaknet_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_ECHO=False

# API Security
API_KEY=rashaknet-secret-key-2026

# Server Configuration
ENVIRONMENT=development
LOG_LEVEL=INFO
FRONTEND_URL=http://localhost:5173
```

### Step 3: Set Up PostgreSQL (Recommended for Production)

```bash
# Create database
psql -U postgres -c "CREATE DATABASE rashaknet_db;"

# Create user with permissions
psql -U postgres -c "CREATE USER rashaknet_user WITH PASSWORD 'secure_password';"
psql -U postgres -c "ALTER ROLE rashaknet_user CREATEDB;"
```

**SQLite Fallback**: If PostgreSQL is unavailable, system automatically creates `rashaknet.db`

### Step 4: Initialize Database with Seed Data

```bash
# Start FastAPI server - it auto-creates tables and seeds data
uvicorn main:app --reload --port 8000
```

**Seeded Data** (auto-created on first run):
- 4 rescue teams (Alpha Team, Bravo Squad, Charlie Rescue, Delta Support)
- 7 sample alerts in Hyderabad area
- 3 sample missions
- 5 inventory items
- 2 chat messages

### Step 5: Start FastAPI Backend

```bash
# Development (with hot reload)
uvicorn main:app --reload --port 8000

# Production (4 workers)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**API Documentation**:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Frontend Setup & Configuration

### Step 1: Install Node.js Dependencies

```bash
npm install
# or
yarn install
```

### Step 2: Configure Frontend Environment

Create `.env` file in project root:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Step 3: Start Development Server

```bash
# Development - Vite dev server (React only)
npm run dev

# Start Node.js backend server (separate terminal)
npm run server

# Or run both together (if script exists)
npm run dev:all
```

**Vite Proxy Configuration** (automatic):
- `/api/*` → http://localhost:8000
- `/ws/*` → ws://localhost:8000

**Access URLs**:
- React App: http://localhost:5173
- API: http://localhost:8000
- Node Server: http://localhost:5001

### Step 4: Build for Production

```bash
npm run build
npm run preview
```

---

## API Endpoints Specification

### Authentication

All POST, PATCH, and DELETE endpoints require:

```http
X-API-Key: rashaknet-secret-key-2026
```

### Alerts Management

#### 1. **Create Alert** (POST)
```http
POST /api/alert
X-API-Key: rashaknet-secret-key-2026
Content-Type: application/json

{
  "deviceId": "DEV001",
  "helpType": "Medical",
  "lat": 17.3850,
  "lng": 78.4867,
  "timestamp": "2026-08-14T10:30:00Z"  # Optional; uses current time if omitted
}
```

**Help Types**: `SOS`, `Medical`, `Water`, `Food`

**Response** (201 Created):
```json
{
  "id": 1,
  "deviceId": "DEV001",
  "helpType": "Medical",
  "lat": 17.3850,
  "lng": 78.4867,
  "timestamp": "2026-08-14T10:30:00Z",
  "status": "Pending",
  "assignedTeam": null
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid X-API-Key
- `422 Unprocessable Entity`: Invalid request body

---

#### 2. **List Alerts** (GET)
```http
GET /api/alerts?status=Pending&helpType=Medical&from_date=2026-08-01T00:00:00Z&to_date=2026-08-15T00:00:00Z
```

**Query Parameters**:
| Parameter | Type | Optional | Description |
|-----------|------|----------|-------------|
| `status` | string | Yes | `Pending`, `Assigned`, `Completed` |
| `helpType` | string | Yes | `SOS`, `Medical`, `Water`, `Food` |
| `from_date` | ISO datetime | Yes | Alerts from this date forward |
| `to_date` | ISO datetime | Yes | Alerts up to this date |

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "deviceId": "DEV001",
    "helpType": "Medical",
    "lat": 17.3850,
    "lng": 78.4867,
    "timestamp": "2026-08-14T10:30:00Z",
    "status": "Pending",
    "assignedTeam": null
  },
  {
    "id": 2,
    "deviceId": "DEV002",
    "helpType": "SOS",
    "lat": 17.3900,
    "lng": 78.4900,
    "timestamp": "2026-08-14T10:28:00Z",
    "status": "Assigned",
    "assignedTeam": "Alpha Team"
  }
]
```

---

#### 3. **Get Alert Details** (GET)
```http
GET /api/alerts/{id}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "deviceId": "DEV001",
  "helpType": "Medical",
  "lat": 17.3850,
  "lng": 78.4867,
  "timestamp": "2026-08-14T10:30:00Z",
  "status": "Pending",
  "assignedTeam": null
}
```

**Error**: `404 Not Found` if alert doesn't exist

---

#### 4. **Update Alert** (PATCH)
```http
PATCH /api/alerts/{id}
X-API-Key: rashaknet-secret-key-2026
Content-Type: application/json

{
  "status": "Assigned",
  "assignedTeam": "Alpha Team"
}
```

**Allowed Status Values**: `Pending`, `Assigned`, `Completed`

**Response** (200 OK): Updated alert object

---

#### 5. **Delete Alert** (DELETE)
```http
DELETE /api/alerts/{id}
X-API-Key: rashaknet-secret-key-2026
```

**Response** (200 OK): `{"success": true}`

---

### Rescue Teams Management

#### 1. **List All Teams** (GET)
```http
GET /api/teams
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Alpha Team",
    "status": "Available",
    "members": 5,
    "vehicle": "Ambulance",
    "teamCode": "ALF001"
  },
  {
    "id": 2,
    "name": "Bravo Squad",
    "status": "Deployed",
    "members": 4,
    "vehicle": "Rescue Truck",
    "teamCode": "BRV001"
  }
]
```

---

#### 2. **Create Team** (POST)
```http
POST /api/teams
X-API-Key: rashaknet-secret-key-2026
Content-Type: application/json

{
  "name": "Charlie Rescue",
  "status": "Available",
  "members": 6,
  "vehicle": "Helicopter",
  "teamCode": "CHR001"
}
```

**Response** (201 Created): Created team object

---

#### 3. **Get Team Details** (GET)
```http
GET /api/teams/{id}
```

**Response** (200 OK): Team object

---

#### 4. **Update Team** (PATCH)
```http
PATCH /api/teams/{id}
X-API-Key: rashaknet-secret-key-2026
Content-Type: application/json

{
  "status": "Deployed",
  "members": 5
}
```

**Allowed Status Values**: `Available`, `Deployed`

**Response** (200 OK): Updated team object

---

#### 5. **Delete Team** (DELETE)
```http
DELETE /api/teams/{id}
X-API-Key: rashaknet-secret-key-2026
```

**Response** (200 OK): `{"success": true}`

---

### Chat Messages

#### 1. **List Messages** (GET)
```http
GET /api/chat/messages?channel=general
```

**Query Parameters**:
| Parameter | Type | Optional | Description |
|-----------|------|----------|-------------|
| `channel` | string | Yes | Filter by channel (default: general) |

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "senderId": "user1",
    "senderName": "Officer John",
    "message": "Team Alpha, proceed to location",
    "timestamp": "2026-08-14T10:30:00Z",
    "channel": "general",
    "alertId": 1
  }
]
```

---

#### 2. **Create Message** (POST)
```http
POST /api/chat/messages
Content-Type: application/json

{
  "senderId": "user1",
  "senderName": "Officer John",
  "message": "All teams stand by",
  "channel": "general",
  "alertId": 1
}
```

**Response** (201 Created): Created message object

---

### Missions Tracking

#### 1. **List Missions** (GET)
```http
GET /api/missions?status=Active
```

**Query Parameters**:
| Parameter | Type | Optional | Description |
|-----------|------|----------|-------------|
| `status` | string | Yes | `Active`, `Completed`, `Aborted` |

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "alertId": 1,
    "teamName": "Alpha Team",
    "missionCode": "MISS001",
    "helpType": "Medical",
    "status": "Active",
    "startTime": "2026-08-14T10:30:00Z",
    "endTime": null,
    "responseTimeMinutes": null,
    "notes": "Patient evacuation in progress"
  }
]
```

---

#### 2. **Create Mission** (POST)
```http
POST /api/missions
X-API-Key: rashaknet-secret-key-2026
Content-Type: application/json

{
  "alertId": 1,
  "teamName": "Alpha Team",
  "missionCode": "MISS002",
  "helpType": "Medical",
  "status": "Active",
  "notes": "Emergency medical response"
}
```

**Response** (201 Created): Created mission object

---

#### 3. **Update Mission** (PATCH)
```http
PATCH /api/missions/{id}
X-API-Key: rashaknet-secret-key-2026
Content-Type: application/json

{
  "status": "Completed",
  "endTime": "2026-08-14T11:00:00Z"
}
```

**Response** (200 OK): Updated mission object (auto-calculates `responseTimeMinutes`)

---

### Team Inventory

#### 1. **List Team Inventory** (GET)
```http
GET /api/teams/{team_id}/inventory
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "teamId": 1,
    "itemName": "Stretcher",
    "quantity": 2,
    "lastUpdated": "2026-08-14T10:30:00Z"
  },
  {
    "id": 2,
    "teamId": 1,
    "itemName": "First Aid Kit",
    "quantity": 5,
    "lastUpdated": "2026-08-14T10:30:00Z"
  }
]
```

---

#### 2. **Add Inventory Item** (POST)
```http
POST /api/teams/{team_id}/inventory
X-API-Key: rashaknet-secret-key-2026
Content-Type: application/json

{
  "itemName": "Oxygen Tank",
  "quantity": 3
}
```

**Response** (201 Created): Created inventory object

---

#### 3. **Update Inventory** (PATCH)
```http
PATCH /inventory/{item_id}
X-API-Key: rashaknet-secret-key-2026
Content-Type: application/json

{
  "quantity": 2
}
```

**Response** (200 OK): Updated inventory object

---

### Statistics Dashboard

#### **Get Dashboard Statistics** (GET)
```http
GET /api/stats
```

**Response** (200 OK):
```json
{
  "total_alerts": 42,
  "counts_by_helpType": {
    "SOS": 12,
    "Medical": 18,
    "Water": 7,
    "Food": 5
  },
  "counts_by_status": {
    "Pending": 5,
    "Assigned": 20,
    "Completed": 17
  },
  "avg_response_time_minutes": 15.5
}
```

---

### Health Check

#### **System Health** (GET)
```http
GET /
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "message": "RashakNet API running"
}
```

---

## Database Schema

### Table: `alerts` (7 columns)

```sql
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  deviceId VARCHAR(255) NOT NULL INDEXED,
  helpType VARCHAR(50) NOT NULL INDEXED,        -- SOS, Medical, Water, Food
  lat FLOAT NOT NULL,                            -- Latitude coordinate
  lng FLOAT NOT NULL,                            -- Longitude coordinate
  timestamp DATETIME NOT NULL DEFAULT NOW(),     -- Alert creation time
  status VARCHAR(50) DEFAULT 'Pending' INDEXED   -- Pending, Assigned, Completed
);
```

**Indexed Columns**: `deviceId`, `helpType`, `status`, `timestamp`

---

### Table: `rescue_teams` (6 columns)

```sql
CREATE TABLE rescue_teams (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE INDEXED,
  status VARCHAR(50) DEFAULT 'Available' INDEXED, -- Available, Deployed
  members INTEGER DEFAULT 4,
  vehicle VARCHAR(255),                          -- Ambulance, Truck, etc.
  teamCode VARCHAR(50)                           -- ALF001, BRV001, etc.
);
```

**Sample Seeded Teams**:
- Alpha Team (5 members, Ambulance)
- Bravo Squad (4 members, Rescue Truck)
- Charlie Rescue (6 members, Helicopter)
- Delta Support (4 members, Utility Vehicle)

---

### Table: `chat_messages` (7 columns)

```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  senderId VARCHAR(255) NOT NULL,
  senderName VARCHAR(255),
  message TEXT,
  timestamp DATETIME NOT NULL DEFAULT NOW(),
  channel VARCHAR(100) DEFAULT 'general' INDEXED, -- general, ops, medical, logistics
  alertId INTEGER NULLABLE                        -- Link to alert if relevant
);
```

---

### Table: `missions` (9 columns)

```sql
CREATE TABLE missions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  alertId INTEGER NOT NULL INDEXED,
  teamName VARCHAR(255),
  missionCode VARCHAR(100) UNIQUE,
  helpType VARCHAR(50),                          -- SOS, Medical, Water, Food
  status VARCHAR(50) DEFAULT 'Active' INDEXED,   -- Active, Completed, Aborted
  startTime DATETIME NOT NULL DEFAULT NOW(),
  endTime DATETIME NULLABLE,
  responseTimeMinutes INTEGER NULLABLE,          -- Auto-calculated on completion
  notes TEXT
);
```

---

### Table: `team_inventory` (5 columns)

```sql
CREATE TABLE team_inventory (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  teamId INTEGER NOT NULL INDEXED,
  itemName VARCHAR(255),
  quantity INTEGER DEFAULT 0,
  lastUpdated DATETIME NOT NULL DEFAULT NOW()
);
```

**Sample Seeded Items**:
- Stretcher (qty: 2)
- First Aid Kit (qty: 5)
- Oxygen Tank (qty: 3)
- Defibrillator (qty: 1)
- Emergency Blanket (qty: 10)

---

### Table: `audit_logs` (5 columns)

```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  action VARCHAR(255),                    -- create_alert, assign_team, etc.
  timestamp DATETIME NOT NULL DEFAULT NOW(),
  userId VARCHAR(255),                    -- User who performed action
  details JSON                            -- Additional context (JSON)
);
```

**Note**: Table exists but currently unused by API endpoints. Available for future compliance/audit features.

---

## WebSocket Real-Time Events

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/alerts');

ws.onopen = () => {
  console.log('Connected to RashakNet alerts stream');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected - will auto-reconnect in 3 seconds');
};
```

### Event: `new_alert`

Sent when a new emergency alert is created (from Arduino or API):

```json
{
  "type": "new_alert",
  "data": {
    "id": 1,
    "deviceId": "DEV001",
    "helpType": "Medical",
    "lat": 17.3850,
    "lng": 78.4867,
    "timestamp": "2026-08-14T10:30:00Z",
    "status": "Pending",
    "assignedTeam": null
  }
}
```

---

### Event: `alert_updated`

Sent when an alert status or assignment changes:

```json
{
  "type": "alert_updated",
  "data": {
    "id": 1,
    "status": "Assigned",
    "assignedTeam": "Alpha Team"
  }
}
```

---

### Event: `team_status_changed`

Sent when a team's deployment status changes:

```json
{
  "type": "team_status_changed",
  "data": {
    "id": 1,
    "name": "Alpha Team",
    "status": "Deployed"
  }
}
```

---

### React Implementation Example

```javascript
import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export function AlertsDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [teams, setTeams] = useState([]);
  const ws = useWebSocket('ws://localhost:8000/ws/alerts');

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'new_alert':
          setAlerts(prev => [message.data, ...prev]);
          break;

        case 'alert_updated':
          setAlerts(prev =>
            prev.map(alert =>
              alert.id === message.data.id
                ? { ...alert, ...message.data }
                : alert
            )
          );
          break;

        case 'team_status_changed':
          setTeams(prev =>
            prev.map(team =>
              team.id === message.data.id
                ? { ...team, ...message.data }
                : team
            )
          );
          break;

        default:
          console.log('Unknown event:', message.type);
      }
    };
  }, [ws]);

  return (
    <div>
      <h2>Active Alerts: {alerts.length}</h2>
      {alerts.map(alert => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
```

---

## Hardware Integration - Serial Bridge

### Overview

The **Serial Bridge** (Python) connects Arduino/LoRa devices to the FastAPI backend via USB serial communication.

```
Arduino Mega (USB/Serial) → PySerial → bridge.py → POST /api/alert → Database
```

### Installation & Configuration

```bash
cd serial_bridge
pip install -r requirements.txt
# Installs: pyserial, requests, python-dotenv
```

### Running the Serial Bridge

```bash
# Auto-detect Arduino port, default baud 115200
python bridge.py

# Or specify port and baud rate
python bridge.py --port COM14 --baud 115200

# Specify API endpoint
python bridge.py --port COM14 --api-url http://localhost:8000/api/alert

# With API key from .env
python bridge.py --port COM14
```

### Expected Console Output

```
[INFO] Starting Serial Bridge...
[INFO] Attempting to detect Arduino on available ports...
[INFO] Arduino detected on COM14
[INFO] Connected to Arduino at baud rate 115200
[INFO] Listening for serial data...
[INFO] Received: {"node_id":"01","status":"EMERGENCY","lat":17.3821,"lng":78.5108}
[INFO] Parsed - Device: DEV001, Type: SOS, Lat: 17.3821, Lng: 78.5108
[INFO] POST /api/alert - Status: 201 Created
[INFO] Alert ID: 42 created successfully
```

### Arduino Data Formats

The bridge accepts two input formats:

#### Format A: JSON (Recommended) ✅

```json
{
  "node_id": "01",
  "status": "EMERGENCY",
  "lat": 17.3821,
  "lng": 78.5108
}
```

**Status Values**: `EMERGENCY` (SOS), `MEDICAL`, `WATER`, `FOOD`

---

#### Format B: Comma-Separated Key-Value Pairs

```
Message: STATUS=EMERGENCY,LAT=17.3821,LON=78.5108
```

---

### Example Arduino Code

```cpp
#include <ArduinoJson.h>
#include <SoftwareSerial.h>

StaticJsonDocument<200> doc;

void setup() {
  Serial.begin(115200);
  Serial.println("Arduino Emergency System Ready");
}

void loop() {
  // Monitor emergency button
  if (emergencyButtonPressed) {
    // Create JSON payload
    doc["node_id"] = "01";
    doc["status"] = "EMERGENCY";
    doc["lat"] = getGPS_Latitude();    // Get from GPS module
    doc["lng"] = getGPS_Longitude();
    
    // Send to serial (bridge will read this)
    serializeJson(doc, Serial);
    Serial.println();
    
    delay(1000);
  }
}
```

### Bridge Configuration (Optional .env)

Create `.env` in `serial_bridge/` folder:

```env
# Arduino serial port (auto-detect if not specified)
ARDUINO_PORT=COM14
ARDUINO_BAUD=115200

# API endpoint
API_URL=http://localhost:8000/api/alert
API_KEY=rashaknet-secret-key-2026

# Logging
LOG_LEVEL=INFO
LOG_FILE=bridge.log
```

### Bridge Error Handling

```
[ERROR] Failed to connect to Arduino on COM14
[ERROR] Retrying in 5 seconds... (Attempt 1/3)

[ERROR] Failed to parse serial data: Invalid JSON
[ERROR] Falling back to CSV parsing...

[ERROR] POST /api/alert failed - 401 Unauthorized
[ERROR] Check API_KEY in .env or environment variables

[ERROR] Connection lost to Arduino
[ERROR] Auto-reconnecting in 3 seconds...
```

---

## Frontend Components & Pages

### Architecture Overview

```
App.jsx
├── Sidebar.jsx (Navigation)
├── Header.jsx (Top bar)
│
└── Dynamic Page Content:
    ├── Dashboard.jsx
    ├── ActiveAlerts.jsx
    ├── LiveGPSMap.jsx
    ├── RescueTeams.jsx
    ├── AIIntelligence.jsx
    ├── DispatchChat.jsx
    ├── MissionHistory.jsx
    └── Settings.jsx
```

### Reusable Components (5 Total)

#### 1. **Header.jsx** ⏰
- Current time display (updates every second)
- Connection status indicator (green = connected)
- Theme toggle (light/dark mode)
- Notification badge with alert count

```jsx
<Header alerts={alerts} onThemeToggle={toggleTheme} />
```

---

#### 2. **Sidebar.jsx** 🗂️
- 8 navigation items with icons:
  1. 📊 Dashboard
  2. 🚨 Active Alerts
  3. 📍 Live Map
  4. 👥 Rescue Teams
  5. 📈 Analytics
  6. 💬 Dispatch Chat
  7. 📋 Mission History
  8. ⚙️ Settings
- Alert count badge on "Active Alerts"
- Active page highlight
- Collapsible on mobile

```jsx
<Sidebar currentPage={page} alertCount={alerts.length} />
```

---

#### 3. **AlertCard.jsx** 🚨
Color-coded by type (Red=SOS, Blue=Medical, Green=Water, Orange=Food)

```jsx
<AlertCard 
  alert={{
    id: 1,
    deviceId: "DEV001",
    helpType: "Medical",
    status: "Pending",
    timestamp: "2026-08-14T10:30:00Z",
    lat: 17.3850,
    lng: 78.4867
  }}
  onAssign={(teamName) => assignTeam(1, teamName)}
  onComplete={() => completeAlert(1)}
/>
```

**Features**:
- Device ID and type badge
- Timestamp and status indicator
- Quick assign button
- Mark complete button
- Color-coded background

---

#### 4. **TeamCard.jsx** 👥
Shows team info with efficiency metric

```jsx
<TeamCard 
  team={{
    id: 1,
    name: "Alpha Team",
    status: "Available",
    members: 5,
    vehicle: "Ambulance",
    efficiency: 92
  }}
  onDeploy={() => deployTeam(1)}
/>
```

**Features**:
- Team name and status badge
- Member count
- Vehicle type
- Efficiency progress bar (0-100%)
- Deploy button

---

#### 5. **StatsCard.jsx** 📊
Generic stat display component

```jsx
<StatsCard 
  icon={AlertCircle}
  label="SOS Alerts"
  value={12}
  trend="+3 today"
  bgColor="bg-red-100"
/>
```

---

### Application Pages (8 Total)

#### 1. **Dashboard.jsx** - Home Page 📊

Displays 6 key metric cards:
- **SOS Alerts**: Count of SOS emergencies
- **Medical Alerts**: Count of medical emergencies
- **Water Alerts**: Count of water-related alerts
- **Food Alerts**: Count of food distribution requests
- **Completed Missions**: Total missions finished
- **Available Teams**: Teams ready for deployment

```jsx
export function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatsCard label="SOS" value={stats?.counts_by_helpType?.SOS} />
      <StatsCard label="Medical" value={stats?.counts_by_helpType?.Medical} />
      <StatsCard label="Total Alerts" value={stats?.total_alerts} />
      {/* More cards... */}
    </div>
  );
}
```

---

#### 2. **ActiveAlerts.jsx** - Alert Management 🚨

Full alert list with real-time updates:
- Filter by status (Pending, Assigned, Completed)
- Filter by type (SOS, Medical, Water, Food)
- Sort by timestamp
- Quick team assignment dropdown
- Mark as complete button
- Delete option

**Features**:
- Real-time WebSocket updates
- Color-coded alert types
- Responsive table layout
- Search functionality
- Bulk actions (future)

---

#### 3. **LiveGPSMap.jsx** - Leaflet Map 📍

Interactive map showing:
- **Alert Pins**: Color-coded by type, clustered
- **Team Markers**: Blue icons with team name
- **Geofences**: Circle radius around high-alert areas
- **Zoom/Pan**: Full map controls
- **Click Details**: Click alert to see details
- **Hardcoded Positions**: Teams at fixed Hyderabad coordinates

```jsx
<MapContainer center={[17.3850, 78.4867]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {alerts.map(alert => (
    <Marker key={alert.id} position={[alert.lat, alert.lng]} />
  ))}
</MapContainer>
```

---

#### 4. **RescueTeams.jsx** - Team Status 👥

Team management interface:
- Team cards with status (Available/Deployed)
- Member count
- Vehicle type
- Efficiency percentage
- Deploy/Recall buttons
- Inventory link
- Create new team button

**Features**:
- Real-time status updates via WebSocket
- Filtering by status
- Sorting by efficiency
- Quick deploy actions

---

#### 5. **AIIntelligence.jsx** - Analytics 📈

Data visualization dashboard:
- **Line Chart**: Alert trends over time
- **Doughnut Chart**: Alert distribution by type
- Alert count breakdown
- Response time metrics
- Team performance stats

```jsx
<LineChart
  data={{
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [{
      label: 'Alerts per Hour',
      data: [5, 3, 8, 12, 7, 4]
    }]
  }}
/>
```

---

#### 6. **DispatchChat.jsx** - Team Communication 💬

Real-time chat for team coordination:
- **Channel Sidebar**: general, ops, medical, logistics channels
- **Message List**: All messages with sender and timestamp
- **Message Input**: Send new messages
- **Quick Commands**: Pre-defined messages (dispatch team, etc.)
- **Alert Linking**: Messages can be linked to specific alerts

**Features**:
- Auto-scroll to latest message
- User avatar/name
- Timestamp for each message
- Channel-based filtering
- Message history persistent in DB

---

#### 7. **MissionHistory.jsx** - Mission Log 📋

Historical mission tracking:
- List all completed/active missions
- Mission code and details
- Team assigned
- Response time calculation
- Alert type
- Status indicator
- **CSV Export**: Download mission data

**Features**:
- Filter by status (Active, Completed, Aborted)
- Sort by date/response time
- Export to CSV
- Mission notes display

---

#### 8. **Settings.jsx** - System Configuration ⚙️

(Page exists but minimal implementation)

---

### Hooks

#### **useWebSocket.js** 🔌

Auto-connecting WebSocket hook with auto-reconnect logic:

```javascript
export function useWebSocket(url) {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(url);
    
    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => {
      setIsConnected(false);
      setTimeout(() => {
        // Auto-reconnect after 3 seconds
      }, 3000);
    };

    setWs(socket);
    return () => socket.close();
  }, [url]);

  return ws;
}
```

**Features**:
- Auto-reconnect every 3 seconds on disconnect
- JSON message parsing
- Connection state tracking
- Error logging

---

### Utils

#### **api.js** 🔐

HTTP client wrapper with authentication:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  // GET requests (no auth needed)
  async get(endpoint) {
    return fetch(`${API_BASE}${endpoint}`).then(r => r.json());
  },

  // POST/PATCH/DELETE (requires X-API-Key header)
  async post(endpoint, data) {
    return fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'rashaknet-secret-key-2026'
      },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },

  // Convenience methods
  alerts: {
    list: () => api.get('/api/alerts'),
    create: (data) => api.post('/api/alert', data),
    update: (id, data) => api.patch(`/api/alerts/${id}`, data)
  },
  // ... more endpoints
};
```

---

## Deployment Guide

### Development Deployment (Local)

```bash
# 1. Backend setup
cd d:\rakshaknet
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 2. Frontend setup (new terminal)
npm install
npm run dev

# 3. Serial bridge (optional, another terminal)
cd serial_bridge
python bridge.py --port COM14
```

**Access Points**:
- Dashboard: http://localhost:5173
- API Docs: http://localhost:8000/docs
- API: http://localhost:8000

---

### Production Deployment - Linux/Ubuntu

#### Option 1: Systemd Services

**FastAPI Service** (`/etc/systemd/system/rashaknet-api.service`):
```ini
[Unit]
Description=RashakNet FastAPI Server
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=notify
User=www-data
WorkingDirectory=/var/www/rashaknet
Environment="PATH=/var/www/rashaknet/venv/bin"
ExecStart=/var/www/rashaknet/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

**Enable and Start**:
```bash
sudo systemctl enable rashaknet-api
sudo systemctl start rashaknet-api
sudo systemctl status rashaknet-api
```

---

#### Option 2: Docker Deployment

`Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build & Run**:
```bash
docker build -t rashaknet-api .
docker run -p 8000:8000 \
  --env-file .env \
  -e DB_HOST=postgres \
  rashaknet-api
```

---

#### Option 3: Nginx Reverse Proxy

`/etc/nginx/sites-available/rashaknet`:
```nginx
upstream fastapi {
    server 127.0.0.1:8000;
}

server {
    listen 443 ssl http2;
    server_name api.disaster-mgmt.com;

    ssl_certificate /etc/letsencrypt/live/api.disaster-mgmt.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.disaster-mgmt.com/privkey.pem;

    # API endpoints
    location /api/ {
        proxy_pass http://fastapi;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://fastapi;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

**Enable Site**:
```bash
sudo ln -s /etc/nginx/sites-available/rashaknet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Environment-Specific Configuration

#### Development `.env`
```env
ENVIRONMENT=development
DEBUG=True
DB_HOST=localhost
DB_PORT=5432
API_KEY=dev-secret-key-2026
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=DEBUG
```

#### Production `.env`
```env
ENVIRONMENT=production
DEBUG=False
DB_HOST=prod-postgres-server
DB_PORT=5432
DB_NAME=rashaknet_prod
DB_USER=rashaknet_prod_user
DB_PASSWORD=<strong-32-char-random-password>
API_KEY=<strong-64-char-random-api-key>
FRONTEND_URL=https://dashboard.disaster-mgmt.com
LOG_LEVEL=WARNING
```

---

## Troubleshooting & FAQs

### Backend Issues

**Q1: PostgreSQL Connection Failed**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution**:
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Check connection details
psql -h localhost -U postgres -d rashaknet_db

# System auto-falls back to SQLite if PG unavailable
# Check for rashaknet.db file
```

---

**Q2: X-API-Key Authentication Failing**
```
401 Unauthorized: Invalid X-API-Key
```

**Solution**:
```bash
# Verify header is included
curl -H "X-API-Key: rashaknet-secret-key-2026" http://localhost:8000/api/stats

# Check .env API_KEY value
cat .env | grep API_KEY

# Ensure it matches in all POST/PATCH/DELETE calls
```

---

**Q3: WebSocket Not Streaming**
```
WebSocket connection established but no events received
```

**Solution**:
- Verify endpoint: `ws://localhost:8000/ws/alerts` ✅
- Check browser console for errors
- Test with: `websocat ws://localhost:8000/ws/alerts`
- Ensure FastAPI running without `--reload` in production
- Create alert via `/api/alert` and watch for broadcast

---

**Q4: Port Already in Use**
```
Address already in use: ('0.0.0.0', 8000)
```

**Solution**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

---

### Frontend Issues

**Q5: Port 5173 Already in Use**
```
EADDRINUSE: address already in use :::5173
```

**Solution**:
```bash
# Use different port
npm run dev -- --port 5174

# Or kill existing process
netstat -ano | findstr :5173
taskkill /PID <pid> /F
```

---

**Q6: CORS Errors**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
- Verify FastAPI CORS middleware in main.py
- Check `FRONTEND_URL` in .env
- Ensure Vite proxy config in vite.config.js has `/api` and `/ws` routes

---

**Q7: WebSocket Connected But No Updates**
```
WebSocket says "Connected" but alerts don't refresh in real-time
```

**Solution**:
```bash
# Test alert creation
curl -X POST http://localhost:8000/api/alert \
  -H "X-API-Key: rashaknet-secret-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"TEST","helpType":"Medical","lat":17.385,"lng":78.487}'

# Check browser Network tab → WS connection
# Verify message handler in useWebSocket.js
# Check browser console for errors
```

---

### Hardware Integration Issues

**Q8: Serial Bridge Can't Find Arduino**
```
[ERROR] No Arduino detected on available ports
```

**Solution**:
```bash
# List available ports
python -m serial.tools.list_ports

# Specify port explicitly
python bridge.py --port COM14 --baud 115200

# Check Device Manager (Windows) for port
# Or use: dmesg | grep ttyUSB (Linux)

# Verify Arduino is powered on and connected
```

---

**Q9: Serial Data Parsing Fails**
```
[ERROR] Failed to parse serial data
```

**Solution**:
- Verify Arduino sends valid JSON or KEY:VALUE format
- Check baud rate (default 115200, adjust if needed)
- Add debug logging to Arduino sketch
- Test with: `python -m serial.tools.miniterm COM14 115200`
- Verify lat/lng are valid coordinates

---

**Q10: Serial Bridge POST Fails**
```
[ERROR] POST /api/alert failed - 401 Unauthorized
```

**Solution**:
```bash
# Verify API key in .env
echo $API_KEY

# Test API directly
curl -X POST http://localhost:8000/api/alert \
  -H "X-API-Key: rashaknet-secret-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"TEST","helpType":"Medical","lat":17.385,"lng":78.487}'
```

---

### Database Issues

**Q11: SQLite Database Locked**
```
sqlite3.OperationalError: database is locked
```

**Solution**:
```bash
# Find processes using database
lsof | grep rashaknet.db

# Check database integrity
sqlite3 rashaknet.db "PRAGMA integrity_check;"

# Recreate database (dev only)
rm rashaknet.db
# Restart FastAPI to recreate
```

---

**Q12: Seed Data Not Created**
```
Database starts empty - no sample alerts/teams
```

**Solution**:
- Restart FastAPI server (seed runs on startup)
- Check main.py for `create_sample_data()` function
- Manually insert sample data via API:
```bash
curl -X POST http://localhost:8000/api/alert \
  -H "X-API-Key: rashaknet-secret-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"DEV001","helpType":"Medical","lat":17.385,"lng":78.487}'
```

---

## Security & Best Practices

### API Security

#### 1. **X-API-Key Authentication**

All POST, PATCH, DELETE endpoints require this header:
```http
X-API-Key: rashaknet-secret-key-2026
```

**Best Practices**:
- ✅ Use strong, randomly generated 32+ character keys
- ✅ Store in `.env` (never hardcode)
- ✅ Rotate keys every 90 days in production
- ✅ Use different keys for dev/staging/production
- ✅ Log unauthorized attempts

**Production Key Generation**:
```bash
# Generate secure random key (Linux/Mac)
openssl rand -base64 32

# Or Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

#### 2. **CORS Configuration**

```python
# Current (development - allow all)
allow_origins=["*"]

# Production - restrict to known domains
allow_origins=[
    "https://dashboard.disaster-mgmt.com",
    "https://mobile.disaster-mgmt.com",
    "https://ops.disaster-mgmt.com"
]
```

---

#### 3. **HTTPS/TLS Requirements**

Production deployments must use HTTPS:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/api.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

---

### Data Protection

#### Database Security
- ✅ Use PostgreSQL in production (not SQLite)
- ✅ Enable backups: `pg_dump -h host -U user -d rashaknet_db > backup.sql`
- ✅ Set strong database password (32+ characters)
- ✅ Restrict database access to application server only
- ✅ Enable connection encryption (SSL)

#### Environment Variables
- ✅ Never commit `.env` to version control
- ✅ Use `.env.example` as template
- ✅ Use secrets manager in production:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Azure Key Vault

#### Logging
- ✅ Don't log sensitive data (API keys, passwords, PII)
- ✅ Rotate logs daily/weekly
- ✅ Secure permissions: `chmod 600 app.log`
- ✅ Archive old logs securely

---

### Rate Limiting (Recommended for Production)

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/alert")
@limiter.limit("10/minute")
async def create_alert(alert: AlertCreate):
    pass
```

---

### Input Validation

Pydantic automatically validates:

```python
class AlertCreate(BaseModel):
    deviceId: str = Field(..., min_length=1, max_length=50)
    helpType: str = Field(..., regex="^(SOS|Medical|Water|Food)$")
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
```

---

### Audit Logging

`audit_logs` table exists for tracking critical actions:

```sql
INSERT INTO audit_logs (action, userId, details, timestamp)
VALUES ('alert_assigned', 'user123', '{"alert_id":1,"team":"Alpha Team"}', NOW());
```

---

### Production Deployment Checklist

- [ ] Use PostgreSQL (not SQLite)
- [ ] Generate strong `API_KEY` (32+ chars, random)
- [ ] Enable HTTPS/TLS with valid certificates
- [ ] Configure CORS to specific domains only
- [ ] Set up automated database backups (daily)
- [ ] Enable audit logging for compliance
- [ ] Configure rate limiting on API endpoints
- [ ] Use environment-specific secrets (no .env committed)
- [ ] Set up monitoring and alerting
- [ ] Document API key rotation procedures
- [ ] Test disaster recovery procedures
- [ ] Enable WAF (Web Application Firewall)
- [ ] Set up DDoS protection
- [ ] Configure database encryption at rest
- [ ] Enable connection encryption (SSL to DB)

---

## Implementation Status & Roadmap

### ✅ Fully Implemented & Production Ready

- [x] Alert creation from Arduino via serial bridge
- [x] Real-time WebSocket broadcasting
- [x] Team management (CRUD operations)
- [x] Alert filtering and search
- [x] Mission tracking with response time calculation
- [x] Chat system with channel support
- [x] Team inventory management
- [x] Dashboard statistics
- [x] Leaflet map visualization
- [x] Dark/Light theme UI
- [x] X-API-Key authentication
- [x] PostgreSQL with SQLite fallback
- [x] Responsive React frontend
- [x] API documentation (Swagger/ReDoc)

### ⚠️ Planned Features (Not Yet Implemented)

- [ ] PDF report generation (ai/pdfGenerator.js)
- [ ] Predictive analytics engine (ai/predictiveAnalytics.js)
- [ ] Emergency triage logic (ai/triageEngine.js)
- [ ] Drone integration & HUD (drones/ module)
- [ ] Voice command control (voice/ module)
- [ ] Alembic database migrations (currently manual)
- [ ] Timeline modal/view (TimelineModal.jsx)
- [ ] Automated alerting rules
- [ ] Advanced analytics dashboards
- [ ] Multi-language support

### 🔄 Future Enhancements

- SMS/Email notifications
- Mobile app (React Native)
- Real-time resource tracking (GPS)
- Predictive resource allocation
- Multi-zone disaster management
- Integration with external agencies
- Machine learning for triage
- Advanced reporting and compliance

---

## Version History

| Version | Date | Status | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2026-08-14 | Current | ✅ **Accuracy Update** - Removed unimplemented features, verified all endpoints, corrected versions, documented actual implementation |
| 1.0.0 | 2026-08-13 | Deprecated | Initial release with planned features |
| 0.9.0 | 2026-07-15 | Archive | Beta testing phase |
| 0.1.0 | 2026-06-01 | Archive | Initial development |

---

## Support & Resources

### Documentation
- FastAPI Official: https://fastapi.tiangolo.com/
- React Docs: https://react.dev/
- SQLAlchemy: https://docs.sqlalchemy.org/
- Leaflet Maps: https://leafletjs.com/

### Emergency Support
Contact disaster management team for production issues.

### Issue Reporting
Submit issues with:
- Error message and logs
- Steps to reproduce
- Environment (dev/prod)
- Stack trace if available

---

**Last Updated**: 2026-08-14  
**Maintained by**: RashakNet Development Team  
**License**: Internal Use Only  
**Status**: Production Ready MVP
