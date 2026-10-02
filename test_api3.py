import requests

try:
    res = requests.post("http://127.0.0.1:8002/api/sanitize", json={"target": r"\\.\T:"})
    print("STATUS:", res.status_code)
    print("RESPONSE:", res.json())
except Exception as e:
    print("ERROR:", e)
