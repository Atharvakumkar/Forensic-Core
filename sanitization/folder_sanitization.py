import os
from pathlib import Path

def sanitize_file(file_path: str, chunk_size: int = 1024 * 1024) -> bool:
    """Basic file sanitization (zero-fill). Re-using logic from SIH/sanitizer.py."""
    path = Path(file_path)
    if not path.is_file():
        return False
        
    try:
        file_size = path.stat().st_size
        with open(path, "r+b") as f:
            remaining = file_size
            while remaining > 0:
                size = min(chunk_size, remaining)
                f.write(b"\x00" * size)
                remaining -= size
            f.flush()
        return True
    except Exception as e:
        print(f"Failed to sanitize {file_path}: {e}")
        return False

def sanitize_folder(folder_path: str) -> dict:
    """
    Recursively sanitize all files within a folder.
    Returns a dictionary summarizing the results.
    """
    path = Path(folder_path)
    if not path.is_dir():
        return {"error": f"{folder_path} is not a directory", "success": False}
        
    results = {
        "folder": folder_path,
        "total_files": 0,
        "sanitized_files": 0,
        "failed_files": 0,
        "success": False
    }
    
    for root, _, files in os.walk(path):
        for file in files:
            full_path = os.path.join(root, file)
            results["total_files"] += 1
            if sanitize_file(full_path):
                results["sanitized_files"] += 1
            else:
                results["failed_files"] += 1
                
    results["success"] = (results["total_files"] > 0) and (results["failed_files"] == 0)
    return results
