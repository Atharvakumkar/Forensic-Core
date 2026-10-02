import requests

try:
    with open('test_target.txt', 'w') as f:
        f.write('test')
    res = requests.post("http://127.0.0.1:8002/api/sanitize", json={"target": "test_target.txt"})
    print("STATUS:", res.status_code)
    print("RESPONSE:", res.json())
except Exception as e:
    print("ERROR:", e)
