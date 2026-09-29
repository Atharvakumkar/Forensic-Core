import os

with open('app/recovery/carver.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "filepath = os.path.join(self.output_dir, filename)" in line:
        new_lines.append("                            if len(file_data) < 1024 * 1024:\n")
        new_lines.append("                                cache_dir = os.path.join(self.output_dir, 'cache')\n")
        new_lines.append("                                os.makedirs(cache_dir, exist_ok=True)\n")
        new_lines.append("                                filepath = os.path.join(cache_dir, filename)\n")
        new_lines.append("                            else:\n")
        new_lines.append("                                filepath = os.path.join(self.output_dir, filename)\n")
    else:
        new_lines.append(line)

with open('app/recovery/carver.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
