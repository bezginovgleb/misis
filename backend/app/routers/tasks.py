from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from bson import ObjectId
import json
from ..models.task import (
    Task, 
    TaskCreate, 
    TaskResponse, 
    TaskFilter, 
    TaskCompletion,
    TaskContent
)
from ..models.user import User
from ..utils.auth import get_current_user, get_current_admin_user
from ..utils.database import get_tasks_collection, get_users_collection
from ..utils.file_handler import save_multiple_images, save_audio_file

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse)
async def create_task(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    difficulty: str = Form("medium"),
    text_content: str = Form(...),
    answers: str = Form(...),  # JSON string
    explanation: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    audio: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new task (admin/teacher only)"""
    tasks_collection = await get_tasks_collection()
    
    # Parse answers from JSON string
    try:
        parsed_answers = json.loads(answers)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON format for answers"
        )
    
    # Handle file uploads
    image_paths = []
    if images and images[0].filename:
        image_paths = await save_multiple_images(images)
    
    audio_path = None
    if audio and audio.filename:
        audio_path = await save_audio_file(audio)
    
    # Create task content
    content = TaskContent(
        text=text_content,
        images=image_paths,
        audio=audio_path
    )
    
    # Create task
    task = Task(
        title=title,
        description=description,
        category=category,
        difficulty=difficulty,
        content=content,
        answers=parsed_answers,
        explanation=explanation,
        created_by=current_user.id
    )
    
    # Save to database
    result = await tasks_collection.insert_one(task.dict(by_alias=True))
    
    # Fetch the created task
    created_task = await tasks_collection.find_one({"_id": result.inserted_id})
    return TaskResponse(**created_task)

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    completed_only: Optional[bool] = None,
    not_completed_only: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 20,
    skip: int = 0,
    current_user: User = Depends(get_current_user)
):
    """Get tasks with filtering options"""
    tasks_collection = await get_tasks_collection()
    
    # Build query
    query = {"is_active": True}
    
    if category:
        query["category"] = category
    
    if difficulty:
        query["difficulty"] = difficulty
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    # Get tasks
    cursor = tasks_collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    tasks = await cursor.to_list(length=limit)
    
    # Get user's completed tasks
    completed_task_ids = set(current_user.progress.completed_tasks)
    
    # Filter based on completion status
    task_responses = []
    for task in tasks:
        task_id = str(task["_id"])
        is_completed = task_id in completed_task_ids
        
        # Apply completion filters
        if completed_only and not is_completed:
            continue
        if not_completed_only and is_completed:
            continue
        
        # Create response (hide answers initially)
        task_response = TaskResponse(
            **task,
            is_completed=is_completed,
            show_answers=False,
            answers=None
        )
        task_responses.append(task_response)
    
    return task_responses

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific task by ID"""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID"
        )
    
    tasks_collection = await get_tasks_collection()
    task = await tasks_collection.find_one({"_id": ObjectId(task_id), "is_active": True})
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check if user has completed this task
    is_completed = task_id in current_user.progress.completed_tasks
    
    return TaskResponse(
        **task,
        is_completed=is_completed,
        show_answers=False,
        answers=None
    )

@router.post("/{task_id}/complete")
async def complete_task(
    task_id: str,
    completion: TaskCompletion,
    current_user: User = Depends(get_current_user)
):
    """Mark a task as completed and reveal answers"""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID"
        )
    
    tasks_collection = await get_tasks_collection()
    users_collection = await get_users_collection()
    
    # Check if task exists
    task = await tasks_collection.find_one({"_id": ObjectId(task_id), "is_active": True})
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update user progress
    if task_id not in current_user.progress.completed_tasks:
        # Add to completed tasks
        current_user.progress.completed_tasks.append(task_id)
        
        # Update category completion count
        category = task["category"]
        if category not in current_user.progress.categories_completed:
            current_user.progress.categories_completed[category] = 0
        current_user.progress.categories_completed[category] += 1
        
        # Update total score (you can implement scoring logic here)
        current_user.progress.total_score += 10  # Base score per task
        
        # Save to database
        await users_collection.update_one(
            {"_id": current_user.id},
            {"$set": {"progress": current_user.progress.dict()}}
        )
    
    # Return task with answers revealed
    return TaskResponse(
        **task,
        is_completed=True,
        show_answers=True,
        answers=task["answers"],
        explanation=task.get("explanation")
    )

@router.get("/categories/list")
async def get_categories(current_user: User = Depends(get_current_user)):
    """Get list of all available categories"""
    tasks_collection = await get_tasks_collection()
    
    # Get distinct categories
    categories = await tasks_collection.distinct("category", {"is_active": True})
    
    return {"categories": categories}

@router.get("/stats/overview")
async def get_task_stats(current_user: User = Depends(get_current_user)):
    """Get task statistics for the current user"""
    tasks_collection = await get_tasks_collection()
    
    # Total tasks
    total_tasks = await tasks_collection.count_documents({"is_active": True})
    
    # Completed tasks
    completed_tasks = len(current_user.progress.completed_tasks)
    
    # Categories stats
    categories_stats = []
    categories = await tasks_collection.distinct("category", {"is_active": True})
    
    for category in categories:
        total_in_category = await tasks_collection.count_documents({
            "category": category,
            "is_active": True
        })
        completed_in_category = current_user.progress.categories_completed.get(category, 0)
        
        categories_stats.append({
            "category": category,
            "total": total_in_category,
            "completed": completed_in_category,
            "progress_percentage": (completed_in_category / total_in_category * 100) if total_in_category > 0 else 0
        })
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "overall_progress": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        "total_score": current_user.progress.total_score,
        "categories": categories_stats
    }

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a task (admin/teacher only)"""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID"
        )
    
    tasks_collection = await get_tasks_collection()
    
    # Soft delete (mark as inactive)
    result = await tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"is_active": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return {"message": "Task deleted successfully"}