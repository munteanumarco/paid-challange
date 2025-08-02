from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class GmailAccountBase(BaseModel):
    email: EmailStr

class GmailAccountCreate(GmailAccountBase):
    pass

class GmailAccount(GmailAccountBase):
    id: int
    google_id: str
    last_sync_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True