from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db

router = APIRouter(prefix='/api')

@router.get('/missions', response_model=List[schemas.MissionResponse])
def get_missions(db: Session = Depends(get_db)):
    return db.query(models.Mission).all()

@router.post('/missions', response_model=schemas.MissionResponse)
def create_mission(mission: schemas.MissionCreate, db: Session = Depends(get_db)):
    db_mission = models.Mission(**mission.model_dump())
    db.add(db_mission)
    db.commit()
    db.refresh(db_mission)
    return db_mission

@router.patch('/missions/{id}', response_model=schemas.MissionResponse)
def update_mission(id: int, mission_update: schemas.MissionUpdate, db: Session = Depends(get_db)):
    db_mission = db.query(models.Mission).filter(models.Mission.id == id).first()
    if not db_mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    update_data = mission_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_mission, key, value)
        
    db.commit()
    db.refresh(db_mission)
    return db_mission

@router.get('/missions/{id}', response_model=schemas.MissionResponse)
def get_mission(id: int, db: Session = Depends(get_db)):
    mission = db.query(models.Mission).filter(models.Mission.id == id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission
