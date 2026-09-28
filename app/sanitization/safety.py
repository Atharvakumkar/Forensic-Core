import os
import subprocess
import json

def normalize_path(path: str) -> str:
    """Normalize a path to its absolute, canonical form."""
    if not path:
        return ""
    try:
        return os.path.normcase(os.path.normpath(os.path.abspath(path)))
    except Exception:
        return path

def is_approved_demo_target(target: str) -> bool:
    """Check if the target is in the hardcoded list of approved demo targets."""
    if not target:
        return False
        
    if target.lower().startswith("\\\\.\\physicaldrive"):
        return False
        
    normalized = normalize_path(target)
    project_root = normalize_path(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    
    allowed_list = [
        normalize_path(os.path.join(project_root, "evidence.img")),
        normalize_path(os.path.join(project_root, "test_data")),
        normalize_path(os.path.join(project_root, "tests", "test_data"))
    ]
    
    for allowed in allowed_list:
        if normalized == allowed or normalized.startswith(allowed + os.sep):
            return True
            
    return False

def verify_vhd_drive(drive_letter: str) -> bool:
    """
    Verify that the given drive letter is positively backed by the approved C:\test.vhd.
    Uses Disk-Number Mutual Binding.
    """
    if drive_letter.upper() != "T":
        return False
        
    vhd_path = r"C:\test.vhd"
    
    if not os.path.exists(vhd_path):
        return False
        
    try:
        # 1. Get disk number of the mounted VHD
        vhd_img_cmd = f"(Get-DiskImage -ImagePath '{vhd_path}').Number"
        vhd_img_res = subprocess.run(["powershell", "-Command", vhd_img_cmd], capture_output=True, text=True)
        if vhd_img_res.returncode != 0:
            return False
        
        vhd_disk_number_str = vhd_img_res.stdout.strip()
        if not vhd_disk_number_str or not vhd_disk_number_str.isdigit():
            return False
            
        vhd_disk_number = int(vhd_disk_number_str)
        
        # 2. Get disk number of the drive letter
        partition_cmd = f"(Get-Partition -DriveLetter {drive_letter}).DiskNumber"
        partition_res = subprocess.run(["powershell", "-Command", partition_cmd], capture_output=True, text=True)
        if partition_res.returncode != 0:
            return False
            
        drive_disk_number_str = partition_res.stdout.strip()
        if not drive_disk_number_str or not drive_disk_number_str.isdigit():
            return False
            
        drive_disk_number = int(drive_disk_number_str)
        
        # 3. Mutual Binding Check
        if vhd_disk_number != drive_disk_number:
            return False
            
        # 4. Get Disk properties
        disk_cmd = f"Get-Disk -Number {vhd_disk_number} | Select-Object IsSystem, IsBoot, Size | ConvertTo-Json"
        disk_res = subprocess.run(["powershell", "-Command", disk_cmd], capture_output=True, text=True)
        if disk_res.returncode != 0:
            return False
            
        try:
            disk_props = json.loads(disk_res.stdout)
        except Exception:
            return False
            
        if disk_props.get("IsSystem") is not False:
            return False
        if disk_props.get("IsBoot") is not False:
            return False
            
        size_bytes = disk_props.get("Size")
        if size_bytes is None or size_bytes > (1024**3):
            return False
            
        # 5. Get Volume properties
        vol_cmd = f"Get-Volume -DriveLetter {drive_letter} | Select-Object FileSystemLabel | ConvertTo-Json"
        vol_res = subprocess.run(["powershell", "-Command", vol_cmd], capture_output=True, text=True)
        if vol_res.returncode != 0:
            return False
            
        try:
            vol_props = json.loads(vol_res.stdout)
        except Exception:
            return False
            
        if vol_props.get("FileSystemLabel") != "SIH_TEST":
            return False
            
        return True
    except Exception:
        return False

def safety_check(target: str) -> bool:
    """
    Main safety firewall.
    Returns True if target is SAFE to sanitize, False otherwise.
    """
    if not target:
        return False
        
    if target.lower().startswith("\\\\.\\physicaldrive"):
        return False
        
    # Check for logical drive \\.\T: or T: or T:\
    if target.upper().startswith("\\\\.\\"):
        drive_letter = target[4:5].upper()
        if target[5:6] == ":" and drive_letter.isalpha():
            if drive_letter == "T":
                return verify_vhd_drive(drive_letter)
            return False
            
    if len(target) >= 2 and target[1] == ":":
        drive_letter = target[0].upper()
        if drive_letter.isalpha():
            if drive_letter == "T":
                return verify_vhd_drive(drive_letter)
            return False
        
    if is_approved_demo_target(target):
        return True
        
    return False
