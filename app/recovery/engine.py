import os
import sys

# Ensure Python can find our modules when running directly
sys.path.append(os.path.dirname(__file__))

from carver import RawCarver
from fs_recovery import FilesystemRecovery
from validator import FileValidator

class RecoveryEngine:
    def __init__(self, image_path: str, output_dir: str = "recovered"):
        self.image_path = image_path
        self.output_dir = output_dir
        
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def run_recovery(self, method: str):
        print(f"\n========================================")
        print(f"[*] INITIALIZING RECOVERY ENGINE")
        print(f"[*] SELECTED METHOD: {method.upper()}")
        print(f"========================================")
        
        # Clear previous recoveries for a clean run
        import shutil
        for f in os.listdir(self.output_dir):
            path = os.path.join(self.output_dir, f)
            if os.path.isfile(path):
                os.remove(path)
            elif os.path.isdir(path):
                shutil.rmtree(path, ignore_errors=True)

        # 1. Run the selected recovery method
        if method == "filesystem":
            fs_engine = FilesystemRecovery(self.image_path, self.output_dir)
            fs_engine.recover_files()
        elif method == "carving":
            carver_engine = RawCarver(self.image_path, self.output_dir)
            carver_engine.scan_image()
        else:
            print("[-] Error: Unknown recovery method.")
            return

        # 2. Automatically validate the recovered files
        print("\n[*] Running Validation Engine...")
        validator = FileValidator(self.output_dir)
        validator.validate_all()
        print(f"========================================\n")

if __name__ == "__main__":
    engine = RecoveryEngine("evidence.img")
    
    # Test Route 1: Filesystem Recovery
    engine.run_recovery("filesystem")
    
    # Test Route 2: Raw Carving
    engine.run_recovery("carving")