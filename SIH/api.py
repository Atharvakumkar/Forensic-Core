from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import sys

# Allow Python to import your existing Team 1 modules
sys.path.insert(0, str(Path(__file__).resolve().parent))

from media_classifier import classify_media
from method_recommender import recommend_method
from safety import safety_check
from hashing import calculate_sha256
from sanitizer import sanitize_file
from verification import verify_sanitization
from audit_logger import generate_audit_log


progress_state = {
    "progress": 0,
    "status": "idle"
}


app = Flask(__name__)
CORS(app)


@app.route("/api/upload", methods=["POST"])
def upload_file():

    if "file" not in request.files:
        return jsonify({
            "success": False,
            "error": "No file uploaded."
        }), 400

    uploaded_file = request.files["file"]

    if uploaded_file.filename == "":
        return jsonify({
            "success": False,
            "error": "No file selected."
        }), 400

    test_data_folder = Path("test_data")
    test_data_folder.mkdir(exist_ok=True)

    file_path = test_data_folder / Path(uploaded_file.filename).name

    uploaded_file.save(file_path)

    return jsonify({
        "success": True,
        "target": str(file_path)
    })


@app.route("/api/progress", methods=["GET"])
def get_progress():
    return jsonify(progress_state)


@app.route("/api/sanitize", methods=["POST"])
def sanitize():

    data = request.get_json()

    if not data or "target" not in data:
        return jsonify({
            "success": False,
            "error": "Target file is required."
        }), 400

    target = data["target"]

    # 1. Media Classification
    media_type = classify_media(target)

    # 2. Method Recommendation
    method = recommend_method(media_type)

    # 3. Safety Check
    safe, message = safety_check(target)

    if not safe:
        return jsonify({
            "success": False,
            "media_type": media_type,
            "method": method,
            "safety_status": "FAILED",
            "message": message
        }), 400

    # 4. Pre-Sanitization Hash
    pre_hash = calculate_sha256(target)

    # 5. Sanitization
    progress_state["progress"] = 0
    progress_state["status"] = "running"

    def update_progress(value):
        progress_state["progress"] = value

    sanitize_file(
        target,
        progress_callback=update_progress
    )

    progress_state["progress"] = 100
    progress_state["status"] = "completed"

    # 6. Verification
    verified = verify_sanitization(target)

    verification_status = "PASSED" if verified else "FAILED"

    # 7. Audit Log
    generate_audit_log(
        target,
        media_type,
        method,
        pre_hash,
        verification_status,
        "",
        ""
    )

    return jsonify({
        "success": verified,
        "target": target,
        "media_type": media_type,
        "method": method,
        "safety_status": "PASSED",
        "pre_sanitization_sha256": pre_hash,
        "sanitization_status": "COMPLETED",
        "verification_status": verification_status,
        "result": "SUCCESS" if verified else "FAILED",
        "audit_log": "audit_log.json"
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )