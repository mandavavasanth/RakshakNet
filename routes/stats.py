from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import get_db

router = APIRouter(prefix='/api')

@router.get('/stats', response_model=schemas.StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total_alerts = db.query(models.Alert).count()
    
    help_types = db.query(models.Alert.helpType, func.count(models.Alert.id)).group_by(models.Alert.helpType).all()
    counts_by_helpType = {ht: count for ht, count in help_types}
    
    statuses = db.query(models.Alert.status, func.count(models.Alert.id)).group_by(models.Alert.status).all()
    counts_by_status = {st: count for st, count in statuses}
    
    avg_resp = db.query(func.avg(models.Mission.responseTimeMinutes)).scalar()
    
    return schemas.StatsResponse(
        total_alerts=total_alerts,
        counts_by_helpType=counts_by_helpType,
        counts_by_status=counts_by_status,
        avg_response_time_minutes=float(avg_resp) if avg_resp else 0.0
    )
