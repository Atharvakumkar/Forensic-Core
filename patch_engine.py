with open('app/recovery/engine.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re
text = text.replace(
    '''        for f in os.listdir(self.output_dir):\n            os.remove(os.path.join(self.output_dir, f))''',
    '''        import shutil\n        for f in os.listdir(self.output_dir):\n            path = os.path.join(self.output_dir, f)\n            if os.path.isfile(path):\n                os.remove(path)\n            elif os.path.isdir(path):\n                shutil.rmtree(path)'''
)

with open('app/recovery/engine.py', 'w', encoding='utf-8') as f:
    f.write(text)
