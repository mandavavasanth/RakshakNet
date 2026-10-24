from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict
from datetime import datetime

class AlertCreate(BaseModel):
    deviceId: str
    helpType: str = Field(..., pattern="^(SOS|Medical|Water|Food)$")
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    rssi: Optional[int] = None
    snr: Optional[float] = None
    accuracy: Optional[float] = None
    timestamp: Optional[datetime] = None

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    assignedTeam: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    deviceId: str
    helpType: str
    lat: float
    lng: float
    rssi: Optional[int] = None
    snr: Optional[float] = None
    accuracy: Optional[float] = None
    timestamp: datetime
    status: str
    assignedTeam: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class TeamCreate(BaseModel):
    name: str
    status: str = 'Available'
    members: int = 4
    vehicle: Optional[str] = None
    teamCode: Optional[str] = None

class TeamUpdate(BaseModel):
    status: Optional[str] = None
    members: Optional[int] = None

class TeamResponse(BaseModel):
    id: int
    name: str
    status: str
    members: int
    vehicle: Optional[str]
    teamCode: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class StatsResponse(BaseModel):
    total_alerts: int
    counts_by_helpType: Dict[str, int]
    counts_by_status: Dict[str, int]
    avg_response_time_minutes: float

class ChatMessageCreate(BaseModel):
    senderId: str
    senderName: Optional[str] = None
    message: str
    alertId: Optional[int] = None
    channel: Optional[str] = 'general'

class ChatMessageResponse(BaseModel):
    id: int
    senderId: str
    senderName: Optional[str]
    message: str
    timestamp: datetime
    alertId: Optional[int]
    channel: str

    model_config = ConfigDict(from_attributes=True)

class MissionResponse(BaseModel):
    id: int
    alertId: Optional[int]
    teamName: str
    missionCode: Optional[str]
    helpType: Optional[str]
    status: str
    startTime: datetime
    endTime: Optional[datetime]
    responseTimeMinutes: Optional[float]
    notes: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class MissionCreate(BaseModel):
    alertId: Optional[int] = None
    teamName: str
    missionCode: Optional[str] = None
    helpType: Optional[str] = None
    status: str = 'Active'

class MissionUpdate(BaseModel):
    status: Optional[str] = None
    endTime: Optional[datetime] = None
    responseTimeMinutes: Optional[float] = None
    notes: Optional[str] = None

class InventoryItemCreate(BaseModel):
    itemName: str
    quantity: int = 0

class InventoryItemUpdate(BaseModel):
    quantity: int

class InventoryItemResponse(BaseModel):
    id: int
    teamId: int
    itemName: str
    quantity: int
    lastUpdated: datetime

    model_config = ConfigDict(from_attributes=True)
