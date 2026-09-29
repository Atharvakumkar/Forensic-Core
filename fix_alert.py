with open('SIH-GUI/secureerase-sih/src/views/RawFileCarvingView.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re
text = re.sub(r'  useEffect\(\(\) => \{\n    if \(\!alertStatus\) return;\n    const timeoutId = window\.setTimeout\(\(\) => setAlertStatus\(null\), 4500\);\n    return \(\) => window\.clearTimeout\(timeoutId\);\n  \}, \[alertStatus\]\);\n', '', text)

with open('SIH-GUI/secureerase-sih/src/views/RawFileCarvingView.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
