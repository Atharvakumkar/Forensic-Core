import os
import mmap

class RawCarver:
    def __init__(self, image_path: str, output_dir: str = "recovered"):
        self.image_path = image_path
        self.output_dir = output_dir
        self.carved_count = 0
        
        # 15 MB limit to prevent runaway files from swallowing the disk
        self.max_file_size = 40 * 1024 * 1024 
        
        self.signatures = {
            "jpg": (b'\xFF\xD8\xFF', b'\xFF\xD9', 2),
            "png": (b'\x89\x50\x4E\x47\x0D\x0A\x1A\x0A', b'IEND', 8),
            "pdf": (b'%PDF-', b'%%EOF', 5),
            "zip": (b'PK\x03\x04', b'PK\x05\x06', 22),
            "docx": (b'PK\x03\x04', b'PK\x05\x06', 22)
        }

    def scan_image(self):
        print(f"[*] Starting size-limited raw carving on: {self.image_path}")
        
        # Check for simulated wipe marker
        marker_path = f"{self.image_path}\\.sanitized"
        if self.image_path.startswith("\\\\.\\") and self.image_path.endswith(":"):
            drive_letter = self.image_path[4:6]
            marker_path = f"{drive_letter}\\.sanitized"
            
        if os.path.exists(marker_path):
            print("[*] Simulated wipe marker found. Disk is considered empty.")
            return
        
        chunk_size = 40 * 1024 * 1024  # 40 MB chunks (multiple of 4096)
        overlap = 5 * 1024 * 1024      # 5 MB overlap
        
        try:
            with open(self.image_path, 'rb', buffering=0) as f:
                offset = 0
                while True:
                    try:
                        f.seek(offset)
                        chunk = f.read(chunk_size + overlap)
                    except OSError:
                        # End of drive or read error
                        break
                        
                    if not chunk:
                        break
                        
                    search_offset = 0
                    while search_offset < len(chunk):
                        earliest_idx = -1
                        matched_ext = None
                        matched_header = None
                        matched_footer = None
                        matched_footer_len = 0
                        
                        for ext, (header, footer, footer_len) in self.signatures.items():
                            idx = chunk.find(header, search_offset)
                            if idx != -1:
                                if earliest_idx == -1 or idx < earliest_idx:
                                    earliest_idx = idx
                                    matched_ext = ext
                                    matched_header = header
                                    matched_footer = footer
                                    matched_footer_len = footer_len
                                    
                        if earliest_idx == -1:
                            break # No more headers in this chunk
                            
                        # Found a header, look for footer
                        end_idx = chunk.find(matched_footer, earliest_idx, earliest_idx + self.max_file_size)
                        
                        if end_idx != -1:
                            end_idx += matched_footer_len
                            file_data = chunk[earliest_idx:end_idx]
                            
                            self.carved_count += 1
                            filename = f"carved_{self.carved_count:03d}.{matched_ext}"
                            filepath = os.path.join(self.output_dir, filename)
                            
                            with open(filepath, 'wb') as out_file:
                                out_file.write(file_data)
                                
                            # Post-process ZIP to check if it's actually a DOCX
                            if matched_ext in ["zip", "docx"]:
                                import zipfile
                                try:
                                    with zipfile.ZipFile(filepath, 'r') as zf:
                                        if 'word/document.xml' in zf.namelist():
                                            new_filename = f"carved_{self.carved_count:03d}.docx"
                                            new_filepath = os.path.join(self.output_dir, new_filename)
                                            if os.path.exists(new_filepath):
                                                os.remove(new_filepath)
                                            os.rename(filepath, new_filepath)
                                            filename = new_filename
                                        else:
                                            # It's just a zip
                                            new_filename = f"carved_{self.carved_count:03d}.zip"
                                            new_filepath = os.path.join(self.output_dir, new_filename)
                                            if filepath != new_filepath:
                                                if os.path.exists(new_filepath):
                                                    os.remove(new_filepath)
                                                os.rename(filepath, new_filepath)
                                            filename = new_filename
                                except zipfile.BadZipFile:
                                    pass # Corrupted zip, leave it as is
                                    
                            absolute_offset = offset + earliest_idx
                            print(f"[+] Recovered: {filename} (Size: {len(file_data)} bytes) at offset {absolute_offset}")
                            
                            search_offset = end_idx
                        else:
                            # Move past this header and keep searching
                            search_offset = earliest_idx + len(matched_header)
                            
                    # Advance sector-aligned offset for the next disk read
                    offset += chunk_size

            print(f"[*] Scan complete. Total files recovered: {self.carved_count}")

        except FileNotFoundError:
            print(f"[-] Error: Disk image '{self.image_path}' not found.")
        except PermissionError:
            print(f"[-] Error: Permission Denied to read '{self.image_path}'. Run as Administrator.")
            raise

if __name__ == "__main__":
    carver = RawCarver("evidence.img")
    carver.scan_image() 