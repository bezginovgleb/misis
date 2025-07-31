from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from datetime import datetime
from bson import ObjectId
from .task import PyObjectId


class UserProgress(BaseModel):
    completed_tasks: List[str] = []
    total_score: int = 0
    categories_completed: Dict[str, int] = {}


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str
    email: EmailStr
    password_hash: str
    role: str = "student"  # student, teacher, admin
    progress: UserProgress = Field(default_factory=UserProgress)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    username: str
    email: EmailStr
    role: str
    progress: UserProgress
    created_at: datetime

    class Config:
        allow_population_by_field_name = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None