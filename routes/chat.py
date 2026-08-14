from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import models
import schemas
from database import get_db

router = APIRouter(prefix='/api')

@router.get('/chat/messages', response_model=List[schemas.ChatMessageResponse])
def get_messages(channel: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.ChatMessage)
    if channel:
        query = query.filter(models.ChatMessage.channel == channel)
    return query.order_by(models.ChatMessage.timestamp.asc()).all()

@router.post('/chat/messages', response_model=schemas.ChatMessageResponse)
def create_message(message: schemas.ChatMessageCreate, db: Session = Depends(get_db)):
    db_message = models.ChatMessage(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get('/chat/messages/{id}', response_model=schemas.ChatMessageResponse)
def get_message(id: int, db: Session = Depends(get_db)):
    message = db.query(models.ChatMessage).filter(models.ChatMessage.id == id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message
