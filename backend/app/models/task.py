from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class TaskContent(BaseModel):
    text: str
    images: List[str] = []
    audio: Optional[str] = None


class TaskCreate(BaseModel):
    title: str
    description: str
    category: str
    difficulty: str = "medium"
    content: TaskContent
    answers: List[str]
    explanation: Optional[str] = None


class Task(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    description: str
    category: str
    difficulty: str
    content: TaskContent
    answers: List[str]
    explanation: Optional[str] = None
    created_by: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class TaskResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    category: str
    difficulty: str
    content: TaskContent
    created_at: datetime
    is_completed: bool = False
    show_answers: bool = False
    answers: Optional[List[str]] = None
    explanation: Optional[str] = None

    class Config:
        allow_population_by_field_name = True


class TaskFilter(BaseModel):
    category: Optional[str] = None
    difficulty: Optional[str] = None
    completed_only: Optional[bool] = None
    not_completed_only: Optional[bool] = None
    search: Optional[str] = None
    limit: int = 20
    skip: int = 0


class TaskCompletion(BaseModel):
    task_id: str
    user_answers: List[str]
    completed_at: datetime = Field(default_factory=datetime.utcnow)