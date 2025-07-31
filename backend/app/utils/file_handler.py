import os
import uuid
import aiofiles
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from PIL import Image
import shutil

# Configuration
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a"}

# Ensure upload directories exist
os.makedirs(f"{UPLOAD_DIR}/images", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/audio", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/temp", exist_ok=True)

def get_file_extension(filename: str) -> str:
    """Get file extension in lowercase"""
    return os.path.splitext(filename)[1].lower()

def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename while preserving the extension"""
    extension = get_file_extension(original_filename)
    unique_id = str(uuid.uuid4())
    return f"{unique_id}{extension}"

async def validate_file_size(file: UploadFile) -> bool:
    """Validate file size"""
    # Read file content to check size
    content = await file.read()
    await file.seek(0)  # Reset file pointer
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    return True

def validate_image_file(filename: str) -> bool:
    """Validate image file extension"""
    extension = get_file_extension(filename)
    return extension in ALLOWED_IMAGE_EXTENSIONS

def validate_audio_file(filename: str) -> bool:
    """Validate audio file extension"""
    extension = get_file_extension(filename)
    return extension in ALLOWED_AUDIO_EXTENSIONS

async def save_image_file(file: UploadFile) -> str:
    """Save uploaded image file with validation and processing"""
    if not validate_image_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image format. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    await validate_file_size(file)
    
    # Generate unique filename
    filename = generate_unique_filename(file.filename)
    file_path = f"{UPLOAD_DIR}/images/{filename}"
    
    # Save the file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Optional: Process image (resize, optimize)
    try:
        await optimize_image(file_path)
    except Exception as e:
        print(f"Image optimization failed: {e}")
    
    return f"/uploads/images/{filename}"

async def save_audio_file(file: UploadFile) -> str:
    """Save uploaded audio file with validation"""
    if not validate_audio_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid audio format. Allowed: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
        )
    
    await validate_file_size(file)
    
    # Generate unique filename
    filename = generate_unique_filename(file.filename)
    file_path = f"{UPLOAD_DIR}/audio/{filename}"
    
    # Save the file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return f"/uploads/audio/{filename}"

async def save_multiple_images(files: List[UploadFile]) -> List[str]:
    """Save multiple image files"""
    if len(files) > 5:  # Limit number of images per task
        raise HTTPException(
            status_code=400,
            detail="Maximum 5 images allowed per task"
        )
    
    image_paths = []
    for file in files:
        if file.filename:  # Skip empty files
            path = await save_image_file(file)
            image_paths.append(path)
    
    return image_paths

async def optimize_image(file_path: str, max_width: int = 1200, quality: int = 85):
    """Optimize image by resizing and compressing"""
    try:
        with Image.open(file_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Resize if image is too large
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Save with optimization
            img.save(file_path, optimize=True, quality=quality)
    except Exception as e:
        print(f"Image optimization error: {e}")

async def delete_file(file_path: str) -> bool:
    """Delete a file from the filesystem"""
    try:
        full_path = file_path.lstrip('/')
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
    return False

async def delete_multiple_files(file_paths: List[str]) -> int:
    """Delete multiple files and return count of successfully deleted files"""
    deleted_count = 0
    for path in file_paths:
        if await delete_file(path):
            deleted_count += 1
    return deleted_count

def get_file_info(file_path: str) -> dict:
    """Get file information"""
    try:
        if os.path.exists(file_path):
            stat = os.stat(file_path)
            return {
                "exists": True,
                "size": stat.st_size,
                "created": stat.st_ctime,
                "modified": stat.st_mtime
            }
    except Exception as e:
        print(f"Error getting file info: {e}")
    
    return {"exists": False}