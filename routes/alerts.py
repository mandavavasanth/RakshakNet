from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

import models
import schemas
from database import get_db
from security import verify_api_key
from websocket_manager import manager

router = APIRouter(prefix='/api')

@router.post('/alert', response_model=schemas.AlertResponse)
async def create_alert(
    alert: schemas.AlertCreate, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(verify_api_key)
):
    db_alert = models.Alert(**alert.model_dump())
    if not db_alert.timestamp:
        db_alert.timestamp = datetime.utcnow()
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    
    response = schemas.AlertResponse.model_validate(db_alert)
    await manager.broadcast({'type': 'new_alert', 'data': response.model_dump(mode='json')})
    return response

@router.get('/alerts', response_model=List[schemas.AlertResponse])
def get_alerts(
    status: Optional[str] = None,
    helpType: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Alert)
    if status:
        query = query.filter(models.Alert.status == status)
    if helpType:
        query = query.filter(models.Alert.helpType == helpType)
    if from_date:
        query = query.filter(models.Alert.timestamp >= from_date)
    if to_date:
        query = query.filter(models.Alert.timestamp <= to_date)
        
    alerts = query.order_by(models.Alert.timestamp.desc()).all()
    return alerts

@router.get('/alerts/{alert_id}', response_model=schemas.AlertResponse)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch('/alerts/{alert_id}', response_model=schemas.AlertResponse)
async def update_alert(
    alert_id: int, 
    alert_update: schemas.AlertUpdate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    db_alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    update_data = alert_update.model_dump(exclude_unset=True)
    
    # If assigning a team, mark them as Deployed
    if 'assignedTeam' in update_data and update_data['assignedTeam']:
        team = db.query(models.RescueTeam).filter(models.RescueTeam.name == update_data['assignedTeam']).first()
        if team:
            team.status = 'Deployed'
            team_resp = schemas.TeamResponse.model_validate(team)
            await manager.broadcast({'type': 'team_status_changed', 'data': team_resp.model_dump(mode='json')})
            
    # If completing an alert, mark the assigned team as Available again
    if update_data.get('status') == 'Completed' and db_alert.assignedTeam:
        team = db.query(models.RescueTeam).filter(models.RescueTeam.name == db_alert.assignedTeam).first()
        if team:
            team.status = 'Available'
            team_resp = schemas.TeamResponse.model_validate(team)
            await manager.broadcast({'type': 'team_status_changed', 'data': team_resp.model_dump(mode='json')})
            
    for key, value in update_data.items():
        setattr(db_alert, key, value)
        
    db.commit()
    db.refresh(db_alert)
    
    response = schemas.AlertResponse.model_validate(db_alert)
    await manager.broadcast({'type': 'alert_updated', 'data': response.model_dump(mode='json')})
    return response

@router.delete('/alerts/{alert_id}')
def delete_alert(
    alert_id: int, 
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    db_alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    db.delete(db_alert)
    db.commit()
    return {"detail": "Alert deleted"}

@router.delete('/alerts')
async def clear_all_alerts(
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    db.query(models.Alert).delete()
    db.commit()
    
    # Broadcast a clear all event so the frontend can update immediately
    await manager.broadcast({'type': 'alerts_cleared', 'data': {}})
    
    return {"detail": "All alerts cleared"}
