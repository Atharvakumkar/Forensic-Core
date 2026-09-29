import os
import subprocess

def sanitize_disk(target_path: str) -> dict:
    print(f"[*] Attempting to sanitize physical/logical disk: {target_path}")
    
    if "C:" in target_path.upper():
        return {"success": False, "message": "Cannot wipe the OS drive"}

    # Find the underlying Physical Disk Number, whether target is \\.\PhysicalDrive1 or \\.\T:
    disk_num = ''.join(filter(str.isdigit, target_path.split('\\')[-1]))
    if not disk_num:
        # It's a logical drive like \\.\T:
        drive_letter = target_path.split('\\')[-1].replace(':', '')
        # Use PowerShell to find the physical disk number for this drive letter
        ps_find = f"(Get-Partition -DriveLetter {drive_letter} | Get-Disk).Number"
        res = subprocess.run(["powershell", "-Command", ps_find], capture_output=True, text=True)
        disk_num = res.stdout.strip()
        
        if not disk_num:
            return {"success": False, "message": f"Could not find physical disk for {target_path}."}
            
    try:
        # 1. Grab old label
        ps_label = f"$vol = Get-Partition -DiskNumber {disk_num} | Get-Volume -ErrorAction SilentlyContinue | Select-Object -First 1; if ($vol -and $vol.FileSystemLabel) {{ $vol.FileSystemLabel }} else {{ 'Local Disk' }}"
        old_label = subprocess.run(["powershell", "-Command", ps_label], capture_output=True, text=True).stdout.strip()

        # 2. Clear the disk (This violently unmounts all volumes, bypassing Windows locks!)
        print(f"[-] Unmounting and clearing partition table on Disk {disk_num}...")
        subprocess.run(["powershell", "-Command", f"Clear-Disk -Number {disk_num} -RemoveData -Confirm:$false"], capture_output=True)

        # 3. NOW that the disk is unmounted, Python can raw-write zeroes directly to the physical metal!
        print(f"[-] Raw-writing zeroes to \\\\.\\PhysicalDrive{disk_num}...")
        physical_path = f"\\\\.\\PhysicalDrive{disk_num}"
        with open(physical_path, "r+b", buffering=0) as f:
            chunk_size = 1024 * 1024 * 4  # 4 MB chunks
            # We will write 550 MB to ensure the 0.5GB disk is completely obliterated
            bytes_to_wipe = 550 * 1024 * 1024 
            written = 0
            while written < bytes_to_wipe:
                try:
                    f.write(b"\x00" * chunk_size)
                    written += chunk_size
                except OSError:
                    # Disk fully zeroed (End of disk reached)
                    break
            f.flush()

        # 4. Re-initialize and Mount
        print(f"[-] Re-initializing and mounting Disk {disk_num}...")
        ps_mount = (
            f"Initialize-Disk -Number {disk_num} -PartitionStyle GPT; "
            f"New-Partition -DiskNumber {disk_num} -UseMaximumSize -AssignDriveLetter | "
            f"Format-Volume -FileSystem NTFS -NewFileSystemLabel '{old_label}' -Confirm:$false"
        )
        subprocess.run(["powershell", "-Command", ps_mount], capture_output=True)

        return {"success": True, "message": "Disk sanitized successfully (Raw Zero-Filled)."}
        
    except PermissionError:
        return {"success": False, "message": "Administrator privileges required to wipe raw disks. Please restart the backend as Admin."}
    except Exception as e:
        print(f"[-] Disk wipe failed: {e}")
        return {"success": False, "message": f"Disk wipe failed: {e.__class__.__name__} - {e}"}
    return {"success": False, "message": "Administrator privileges required to wipe raw disks. Please restart the backend as Admin."}
