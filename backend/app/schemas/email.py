from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EmailBase(BaseModel):
    gmail_id: str
    subject: str
    sender: str
    content: str
    summary: Optional[str] = None
    received_at: datetime

class EmailCreate(EmailBase):
    category_id: Optional[int] = None

class EmailUpdate(BaseModel):
    category_id: Optional[int] = None
    summary: Optional[str] = None
    is_archived: Optional[bool] = None

class Email(EmailBase):
    id: int
    category_id: Optional[int] = None
    user_id: int
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True