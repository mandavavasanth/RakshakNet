from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db

router = APIRouter(prefix='/api')

@router.get('/teams/{team_id}/inventory', response_model=List[schemas.InventoryItemResponse])
def get_inventory(team_id: int, db: Session = Depends(get_db)):
    team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return db.query(models.TeamInventory).filter(models.TeamInventory.teamId == team_id).all()

@router.post('/teams/{team_id}/inventory', response_model=schemas.InventoryItemResponse)
def add_inventory_item(team_id: int, item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    db_item = models.TeamInventory(**item.model_dump(), teamId=team_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.patch('/inventory/{item_id}', response_model=schemas.InventoryItemResponse)
def update_inventory_item(item_id: int, item_update: schemas.InventoryItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.TeamInventory).filter(models.TeamInventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db_item.quantity = item_update.quantity
    db.commit()
    db.refresh(db_item)
    return db_item
