from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from database import Base

class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    deviceId = Column(String(255), nullable=False, index=True)
    helpType = Column(String(50), nullable=False, index=True)  # SOS, Medical, Water, Food
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    rssi = Column(Integer, nullable=True)  # LoRa signal strength in dBm (e.g. -45)
    snr = Column(Float, nullable=True)  # Signal-to-Noise Ratio in dB (e.g. 12.5)
    accuracy = Column(Float, nullable=True)  # Estimated GPS accuracy in meters
    status = Column(String(50), default='Pending', index=True)  # Pending, Assigned, Completed
    assignedTeam = Column(String(255), nullable=True)

class RescueTeam(Base):
    __tablename__ = 'rescue_teams'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    status = Column(String(50), default='Available', index=True)  # Available, Deployed
    members = Column(Integer, default=4)
    vehicle = Column(String(255), nullable=True)
    teamCode = Column(String(50), nullable=True)

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    action = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    userId = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)

class ChatMessage(Base):
    __tablename__ = 'chat_messages'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    senderId = Column(String(255), nullable=False)
    senderName = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    alertId = Column(Integer, nullable=True)
    channel = Column(String(100), default='general')

class TeamInventory(Base):
    __tablename__ = 'team_inventory'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    teamId = Column(Integer, nullable=False)
    itemName = Column(String(255), nullable=False)
    quantity = Column(Integer, default=0)
    lastUpdated = Column(DateTime, default=datetime.utcnow)

class Mission(Base):
    __tablename__ = 'missions'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alertId = Column(Integer, nullable=True)
    teamName = Column(String(255), nullable=False)
    missionCode = Column(String(50), nullable=True)
    helpType = Column(String(50), nullable=True)
    status = Column(String(50), default='Active')  # Active, Completed, Aborted
    startTime = Column(DateTime, default=datetime.utcnow)
    endTime = Column(DateTime, nullable=True)
    responseTimeMinutes = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
