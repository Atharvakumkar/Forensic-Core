import os
for root, dirs, files in os.walk('.'):
    if '__pycache__' in root or '.git' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                try:
                    content = f.read()
                    if 'app.sanitization' in content:
                        print(f"FOUND IN: {filepath}")
                except Exception as e:
                    pass
