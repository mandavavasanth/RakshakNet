# RakshakNet — Disaster Command Center

RakshakNet is a military-grade, real-time disaster emergency management and operations dashboard. Built with a dark, high-contrast UI, it is designed to monitor, track, and dispatch rescue teams to critical emergencies captured via LoRa hardware nodes in the field.

## Features

- **Real-Time LoRa Hardware Integration**: Seamlessly intercepts packet data from Arduino Mega LoRa receivers via USB Serial, parsing and transmitting it to the application backend.
- **Live Interactive Maps**: Embeds exact GPS coordinates of incoming emergencies into a dynamic Leaflet map, tracking SOS, Medical, Food, and Water alerts.
- **Intelligent Dispatching**: Assign rescue teams to specific alerts. Assigned teams are instantly marked as 'Deployed' to prevent double-booking, and can be 'Force Assigned' for special orders.
- **Mission Logging**: Generate and download complete mission reports directly to CSV/Excel for offline usage.
- **WebSocket Synchronization**: Complete, instant synchronization across the dashboard using WebSockets. When a LoRa packet is received, the frontend immediately pops up an alert badge and populates the dashboard.

## Tech Stack

### Frontend
- **React + Vite**: High-performance, modern web application framework.
- **Vanilla CSS**: Fully custom, responsive, military-themed design system without relying on external UI libraries like Tailwind.
- **React-Leaflet**: Embedded, interactive GPS mapping.

### Backend
- **FastAPI**: Blazing fast Python backend handling routing, validation, and real-time WebSockets.
- **SQLAlchemy + SQLite**: Robust ORM tracking teams, alerts, inventory, and missions (easily upgradeable to PostgreSQL via `.env`).
- **PySerial Bridge**: An asynchronous Python script that acts as a bridge between the physical COM port (connected to the Arduino Mega) and the FastAPI backend.

## Hardware Setup

The backend relies on physical hardware transmitting location data.
1. Ensure your **Arduino Mega** is connected via USB.
2. The default port is configured to `COM14` with a baud rate of `115200`.
3. The LoRa transmitter sends packets formatted as:
   `NODE=01,STATUS=SOS,LAT=17.3850,LON=78.4867`

## Local Development Setup

### 1. Backend Server
1. Ensure you have Python 3 installed.
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI backend:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will automatically create the local SQLite database and seed initial rescue teams.*

### 2. Frontend Application
1. Open a new terminal.
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard at `http://localhost:5173`.

### 3. Serial Bridge (Hardware Link)
To start intercepting live packets from your Arduino:
1. Ensure the backend (`uvicorn`) is running.
2. Run the bridge script:
   ```bash
   python serial_bridge/bridge.py --port COM14 --baud 115200
   ```
3. As packets arrive, they will be sanitized, formatted, and instantly displayed on your dashboard.
