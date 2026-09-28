import React, { useState, useEffect } from 'react';

export default function SanitizationView() {
  const [target, setTarget] = useState("drive");
  const [method, setMethod] = useState("NIST 800-88 (Clear)");
  const [verify, setVerify] = useState(true);
  const [certificate, setCertificate] = useState(true);
  const [audit, setAudit] = useState(false);
  const [eject, setEject] = useState(false);
  const [hardware, setHardware] = useState(false);

  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedTarget, setUploadedTarget] = useState(null);

  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);

  // Timing
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState(null);

  // Fetch available drives
  useEffect(() => {
    async function fetchDrives() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/drives"
        );

        const data = await response.json();

        // Keep the safe logical-drive filtering from Atharva's changes
        const safeLogical = (data.logical || []).filter((d) => {
          const id = String(d.id || "").toUpperCase();

          return (
            !id.includes("C:") &&
            !id.includes("D:")
          );
        });

        setDrives(safeLogical);

        if (safeLogical.length > 0) {
          setSelectedDrive(safeLogical[0]);
        }
      } catch (err) {
        console.error(
          "Failed to fetch drives",
          err
        );
      }
    }

    fetchDrives();
  }, []);

  // Real backend progress polling
  useEffect(() => {
    if (!started) return;

    const progressInterval = setInterval(async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/api/progress"
        );

        const data = await response.json();

        const currentProgress =
          Number(data.progress) || 0;

        setProgress(currentProgress);

        if (data.status === "completed") {
          setProgress(100);
          clearInterval(progressInterval);
        }
      } catch (error) {
        console.error(
          "Progress API Error:",
          error
        );
      }
    }, 300);

    return () => {
      clearInterval(progressInterval);
    };
  }, [started]);

  // Elapsed time
  useEffect(() => {
    if (!started) return;

    const timer = setInterval(() => {
      setElapsedSeconds(
        (previous) => previous + 1
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [started]);

  // Estimated remaining time
  useEffect(() => {
    if (
      !started ||
      progress <= 0 ||
      progress >= 100 ||
      elapsedSeconds <= 0
    ) {
      return;
    }

    const estimatedTotal =
      elapsedSeconds / (progress / 100);

    const remaining = Math.max(
      0,
      Math.ceil(
        estimatedTotal - elapsedSeconds
      )
    );

    setEstimatedSeconds(remaining);
  }, [
    progress,
    elapsedSeconds,
    started
  ]);

  function formatTime(seconds) {
    if (
      seconds === null ||
      seconds === undefined
    ) {
      return "--:--:--";
    }

    const hours = Math.floor(
      seconds / 3600
    );

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const secs = seconds % 60;

    return [
      hours,
      minutes,
      secs
    ]
      .map((value) =>
        String(value).padStart(2, "0")
      )
      .join(":");
  }

  async function handleFileSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log(
        "Upload API Response:",
        data
      );

      if (data.success) {
        setUploadedTarget(data.target);
      } else {
        alert(
          `Upload failed: ${
            data.error ||
            "Unknown error"
          }`
        );

        console.error(
          "Upload failed:",
          data.error
        );
      }
    } catch (error) {
      console.error(
        "Upload Error:",
        error
      );

      alert(
        "Could not connect to the sanitization engine."
      );
    }
  }

  function handleStartClick() {
    const payloadTarget =
      target === "drive"
        ? selectedDrive?.id
        : uploadedTarget;

    if (!payloadTarget) {
      alert(
        "Please select a target first."
      );
      return;
    }

    setShowConfirm(true);
  }

  async function startSanitization() {
    setShowConfirm(false);

    try {
      const payloadTarget =
        target === "drive"
          ? selectedDrive?.id
          : uploadedTarget;

      if (!payloadTarget) {
        alert(
          "Please select a target first."
        );
        return;
      }

      // Reset progress and timing
      setProgress(0);
      setElapsedSeconds(0);
      setEstimatedSeconds(null);
      setResult(null);

      // Start progress tracking BEFORE
      // sending the long-running request
      setStarted(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/sanitize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target: payloadTarget,
          }),
        }
      );

      const data = await response.json();

      setResult(data);

      console.log(
        "Sanitization API Response:",
        data
      );

      if (data.success) {
        setProgress(100);
        setEstimatedSeconds(0);
      } else {
        setStarted(false);

        const errorMsg =
          data.message ||
          data.error ||
          data.result ||
          "Unknown error";

        alert(
          `Sanitization failed: ${errorMsg}`
        );

        console.error(
          "Sanitization failed:",
          errorMsg
        );
      }
    } catch (error) {
      console.error(
        "API Error:",
        error
      );

      setStarted(false);

      alert(
        "Could not connect to the sanitization engine."
      );
    }
  }

  return (
    <div className="content">

      {/* PAGE HEADER */}
      <div className="page-header">

        <div className="page-title">

          <button className="back-button">
            ←
          </button>

          <div>
            <h1>
              Data Sanitization
            </h1>

            <p>
              Secure. Permanent. Verifiable.
            </p>
          </div>

        </div>

      </div>

      {/* TARGET CARDS */}
      <div className="target-grid">

        <button
          className={`target-card ${
            target === "drive"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setTarget("drive")
          }
        >

          <div className="target-icon">
            ▰
          </div>

          <div className="target-radio">
            {target === "drive"
              ? "✓"
              : ""}
          </div>

          <h3>
            Disk / Drive
          </h3>

          <p>
            Sanitize entire HDD, SSD or external drives
          </p>

        </button>

        <button
          className={`target-card ${
            target === "file"
              ? "selected"
              : ""
          }`}
          onClick={() => {
            setTarget("file");

            document
              .getElementById("file-input")
              .click();
          }}
        >

          <div className="target-icon">
            ▱
          </div>

          <div className="target-radio">
            {target === "file"
              ? "✓"
              : ""}
          </div>

          <h3>
            File / Folder
          </h3>

          <p>
            Securely erase selected files or folders
          </p>

        </button>

        <button
          className={`target-card ${
            target === "image"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setTarget("image")
          }
        >

          <div className="target-icon">
            ▣
          </div>

          <div className="target-radio">
            {target === "image"
              ? "✓"
              : ""}
          </div>

          <h3>
            Disk Image
          </h3>

          <p>
            Sanitize disk image files (e.g. .img, .dd)
          </p>

        </button>

        <button
          className={`target-card ${
            target === "removable"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setTarget("removable")
          }
        >

          <div className="target-icon">
            ♧
          </div>

          <div className="target-radio">
            {target === "removable"
              ? "✓"
              : ""}
          </div>

          <h3>
            Removable Media
          </h3>

          <p>
            Sanitize USB drives, SD cards, etc.
          </p>

        </button>

        <input
          id="file-input"
          type="file"
          style={{
            display: "none"
          }}
          onChange={handleFileSelect}
        />

        {selectedFile && (
          <div className="selected-file">
            Selected:{" "}
            {selectedFile.name}
          </div>
        )}

      </div>

      {/* MAIN GRID */}
      <div className="main-grid">

        {/* CONFIGURATION */}
        <section className="panel configuration">

          <div className="panel-title">

            <span>
              ⚙
            </span>

            <h2>
              Sanitization Configuration
            </h2>

          </div>

          <div className="config-grid">

            <div className="config-left">

              <label>
                Select Drive / Device
              </label>

              <select
                className="select-box"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#1c2431",
                  color: "white",
                  border:
                    "1px solid #2a3441",
                  borderRadius: "8px"
                }}
                value={
                  selectedDrive?.id || ""
                }
                onChange={(e) => {

                  const drive =
                    drives.find(
                      (d) =>
                        d.id ===
                        e.target.value
                    );

                  if (drive) {
                    setSelectedDrive(
                      drive
                    );
                  }

                }}
              >

                {drives.map((d) => (

                  <option
                    key={d.id}
                    value={d.id}
                  >
                    {d.name} (
                    {d.size_gb} GB)
                  </option>

                ))}

              </select>

              <div className="device-info">

                <div>
                  <span>
                    Model
                  </span>

                  <strong>
                    {
                      selectedDrive
                        ? selectedDrive.name
                        : "N/A"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Serial
                  </span>

                  <strong>
                    {
                      selectedDrive
                        ? selectedDrive.id
                        : "N/A"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Capacity
                  </span>

                  <strong>
                    {
                      selectedDrive
                        ? selectedDrive.size_gb +
                          " GB"
                        : "N/A"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Type
                  </span>

                  <strong>
                    Disk / Drive
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* SANITIZATION PROGRESS */}
        <section className="panel side-panel progress-panel">

          <h2>
            ◷ &nbsp; Sanitization Progress
          </h2>

          {/* PROGRESS CIRCLE */}
          <div className="progress-circle">

            <div>

              <strong>
                {`${progress}%`}
              </strong>

              <span>
                {
                  progress >= 100
                    ? "Completed"
                    : started
                      ? "Running"
                      : "Not Started"
                }
              </span>

            </div>

          </div>

          {/* RESULT */}
          {result && (

            <div
              className="sanitization-result"
              style={{
                fontSize: "12px",
                color: "#c7d5e5",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                marginBottom: "15px",
                overflowWrap: "anywhere",
                wordBreak: "break-word"
              }}
            >

              <strong
                style={{
                  color:
                    result.success
                      ? "#00d8a1"
                      : "#ff626b"
                }}
              >
                {
                  result.success
                    ? "✓ Sanitization Successful"
                    : "✗ Sanitization Failed"
                }
              </strong>

              <span>
                Target:{" "}
                {result.target}
              </span>

              <span>
                Media:{" "}
                {result.media_type}
                {" · "}
                Method:{" "}
                {result.method}
              </span>

              <span>
                SHA-256:{" "}
                {result.pre_sanitization_sha256}
              </span>

              <span>
                Verification:{" "}
                {result.verification_status}
              </span>

              <span>
                Audit Log:{" "}
                {result.audit_log}
              </span>

            </div>

          )}

          {/* PROGRESS STATS */}
          <div className="progress-stats">

            <div>

              <span>
                Elapsed Time
              </span>

              <strong>
                {formatTime(
                  elapsedSeconds
                )}
              </strong>

            </div>

            <div>

              <span>
                Estimated Time
              </span>

              <strong>
                {
                  progress > 0 &&
                  progress < 100 &&
                  estimatedSeconds !== null
                    ? formatTime(
                        estimatedSeconds
                      )
                    : "--:--:--"
                }
              </strong>

            </div>

            <div>

              <span>
                Current Operation
              </span>

              <strong>
                {
                  progress >= 100
                    ? "Sanitization Complete"
                    : started
                      ? `Sanitizing... ${progress}%`
                      : "-"
                }
              </strong>

            </div>

          </div>

          {/* REAL BACKEND PROGRESS BAR */}
          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                transition:
                  "width 0.3s ease"
              }}
            />

          </div>

          {/* START BUTTON */}
          <button
            className="start-button"
            onClick={handleStartClick}
            disabled={
              started &&
              progress < 100
            }
          >
            {started &&
            progress < 100
              ? "⟳  Sanitizing..."
              : "▶  Start Sanitization"}
          </button>

        </section>

        {/* QUICK ACTIONS */}
        <section className="panel side-panel quick-actions-panel">

          <h2>
            ◆ &nbsp; Quick Actions
          </h2>

          <div className="quick-actions">

            <button>
              <span>
                ▤
              </span>

              View Reports
            </button>

            <button>
              <span>
                ◉
              </span>

              Certificates
            </button>

            <button>
              <span>
                ◆
              </span>

              Sanitization Guidelines
            </button>

          </div>

        </section>

      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >

          <div
            className="modal-content"
            style={{
              background: "#1c2431",
              padding: "30px",
              borderRadius: "10px",
              maxWidth: "500px",
              border:
                "1px solid #ff626b"
            }}
          >

            <h2
              style={{
                color: "#ff626b",
                marginTop: 0
              }}
            >
              ⚠️ Confirm Sanitization
            </h2>

            <p>
              You are about to permanently
              securely erase the following
              target:
            </p>

            <strong
              style={{
                display: "block",
                margin: "15px 0",
                padding: "10px",
                background: "#0d131f",
                borderRadius: "5px",
                overflowWrap: "anywhere"
              }}
            >
              {target === "drive"
                ? selectedDrive?.id
                : uploadedTarget}
            </strong>

            <p
              style={{
                color: "#bdacb7",
                fontSize: "14px"
              }}
            >
              This action CANNOT be undone.
              The backend safety firewall
              will also perform a final
              validation before proceeding.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
                justifyContent: "flex-end"
              }}
            >

              <button
                onClick={() =>
                  setShowConfirm(false)
                }
                style={{
                  padding: "10px 20px",
                  background:
                    "transparent",
                  border:
                    "1px solid #2a3441",
                  color: "white",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

              <button
                onClick={
                  startSanitization
                }
                style={{
                  padding: "10px 20px",
                  background:
                    "#ff626b",
                  border: "none",
                  color: "white",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Proceed with Erase
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}