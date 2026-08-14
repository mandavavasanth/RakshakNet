from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db
from security import verify_api_key
from websocket_manager import manager

router = APIRouter(prefix='/api')

@router.get('/teams', response_model=List[schemas.TeamResponse])
def get_teams(db: Session = Depends(get_db)):
    return db.query(models.RescueTeam).all()

@router.post('/teams', response_model=schemas.TeamResponse)
def create_team(
    team: schemas.TeamCreate, 
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    db_team = models.RescueTeam(**team.model_dump())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@router.get('/teams/{team_id}', response_model=schemas.TeamResponse)
def get_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.patch('/teams/{team_id}', response_model=schemas.TeamResponse)
async def update_team(
    team_id: int, 
    team_update: schemas.TeamUpdate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    db_team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    update_data = team_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_team, key, value)
        
    db.commit()
    db.refresh(db_team)
    
    response = schemas.TeamResponse.model_validate(db_team)
    await manager.broadcast({'type': 'team_status_changed', 'data': response.model_dump(mode='json')})
    return response

@router.delete('/teams/{team_id}')
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    db_team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(db_team)
    db.commit()
    return {"detail": "Team deleted"}
