import os
from pathlib import Path
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta

from database import engine, Base, SessionLocal
from routes import alerts, teams, stats, chat, missions, inventory
from websocket_manager import manager
import models

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title='RakshakNet API',
    description='RakshakNet disaster emergency management system backend API.',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In dev allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alerts.router)
app.include_router(teams.router)
app.include_router(stats.router)
app.include_router(chat.router)
app.include_router(missions.router)
app.include_router(inventory.router)

def seed_db():
    db = SessionLocal()
    try:
        # Check if teams are empty
        if db.query(models.RescueTeam).count() == 0:
            teams_data = [
                models.RescueTeam(name="Alpha Team", teamCode="TEAM-01", members=5, vehicle="Heavy Rescue Truck", status="Assigned"),
                models.RescueTeam(name="Bravo Squad", teamCode="TEAM-02", members=4, vehicle="EOC Ambulance", status="Assigned"),
                models.RescueTeam(name="Charlie Rescue", teamCode="TEAM-03", members=6, vehicle="All-Terrain 4x4", status="Available"),
                models.RescueTeam(name="Delta Support", teamCode="TEAM-04", members=4, vehicle="Inflatable Boat Carrier", status="Available")
            ]
            db.add_all(teams_data)
            db.commit()

            # Alerts in Hyderabad (lat: 17.38-17.40, lng: 78.47-78.50)
            alerts_data = [
                models.Alert(deviceId="DEV001", helpType="SOS", lat=17.3850, lng=78.4867, rssi=-45, snr=12.5, accuracy=3.2, status="Assigned", assignedTeam="Alpha Team"),
                models.Alert(deviceId="DEV002", helpType="Medical", lat=17.3910, lng=78.4900, rssi=-62, snr=9.8, accuracy=5.1, status="Assigned", assignedTeam="Bravo Squad"),
                models.Alert(deviceId="DEV003", helpType="Water", lat=17.3880, lng=78.4750, rssi=-78, snr=6.3, accuracy=8.7, status="Pending"),
                models.Alert(deviceId="DEV004", helpType="Food", lat=17.3950, lng=78.4800, rssi=-55, snr=11.2, accuracy=4.0, status="Pending"),
                models.Alert(deviceId="DEV005", helpType="Medical", lat=17.3980, lng=78.4950, rssi=-91, snr=3.1, accuracy=15.4, status="Pending"),
                models.Alert(deviceId="DEV006", helpType="SOS", lat=17.4000, lng=78.4700, rssi=-38, snr=13.7, accuracy=2.5, status="Completed"),
                models.Alert(deviceId="DEV007", helpType="Water", lat=17.3820, lng=78.4980, rssi=-70, snr=7.9, accuracy=6.8, status="Completed")
            ]
            db.add_all(alerts_data)
            db.commit()
            
            # Missions linked to alerts
            missions_data = [
                models.Mission(alertId=1, teamName="Alpha Team", missionCode="MSN-001", helpType="SOS", status="Active", startTime=datetime.utcnow() - timedelta(minutes=45)),
                models.Mission(alertId=2, teamName="Bravo Squad", missionCode="MSN-002", helpType="Medical", status="Active", startTime=datetime.utcnow() - timedelta(minutes=30)),
                models.Mission(alertId=6, teamName="Charlie Rescue", missionCode="MSN-003", helpType="SOS", status="Completed", startTime=datetime.utcnow() - timedelta(hours=2), endTime=datetime.utcnow(), responseTimeMinutes=15.5)
            ]
            db.add_all(missions_data)
            db.commit()

            # Inventory
            inventory_data = [
                models.TeamInventory(teamId=1, itemName="Medical Kits", quantity=10),
                models.TeamInventory(teamId=1, itemName="Life Jackets", quantity=5),
                models.TeamInventory(teamId=2, itemName="Medical Kits", quantity=20),
                models.TeamInventory(teamId=3, itemName="Food Packets", quantity=50),
                models.TeamInventory(teamId=4, itemName="Water Bottles", quantity=100)
            ]
            db.add_all(inventory_data)
            db.commit()

            # Chat
            chats = [
                models.ChatMessage(senderId="SYS", senderName="System", message="EOC activated.", channel="general"),
                models.ChatMessage(senderId="TEAM-01", senderName="Alpha Team", message="En route to location for DEV001 SOS.", channel="general", alertId=1)
            ]
            db.add_all(chats)
            db.commit()
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    seed_db()

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/health")
def health_check():
    return {"status": "RakshakNet API is running"}

# ---------------------------------------------------------------------------
# Serve the Vite/React production build from dist/ when it exists.
# This lets a single Render web service handle both API and frontend.
# ---------------------------------------------------------------------------
DIST_DIR = Path(__file__).parent / "dist"

if DIST_DIR.is_dir():
    # Serve hashed JS/CSS bundles at /assets
    app.mount(
        "/assets",
        StaticFiles(directory=DIST_DIR / "assets"),
        name="static-assets",
    )

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Return the requested file from dist/, falling back to index.html
        so that React client-side routing works."""
        file = DIST_DIR / full_path
        if file.is_file():
            return FileResponse(file)
        return FileResponse(DIST_DIR / "index.html")
