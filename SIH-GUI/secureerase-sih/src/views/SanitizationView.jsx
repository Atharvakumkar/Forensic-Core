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
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedTarget, setUploadedTarget] = useState(null);

  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);

  useEffect(() => {
    async function fetchDrives() {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/drives");
        const data = await response.json();
        const safeLogical = (data.logical || []).filter(d => {
           const id = d.id.toUpperCase();
           return !id.includes("C:") && !id.includes("D:");
        });
        setDrives(safeLogical);
        if (safeLogical.length > 0) {
          setSelectedDrive(safeLogical[0]);
        }
      } catch (err) {
        console.error("Failed to fetch drives", err);
      }
    }
    fetchDrives();
  }, []);

  async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Upload API Response:", data);

      if (data.success) {
        setUploadedTarget(data.target);
        alert(`File uploaded successfully: ${data.target}`);
      } else {
        alert(`Upload failed: ${data.error}`);
        console.error("Upload failed:", data.error);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Could not connect to the sanitization engine.");
    }
  }

  const [showConfirm, setShowConfirm] = useState(false);

  function handleStartClick() {
    const payloadTarget = target === "drive" ? selectedDrive?.id : uploadedTarget;
    if (!payloadTarget) {
      alert("Please select a target first.");
      return;
    }
    setShowConfirm(true);
  }

  async function startSanitization() {
    setShowConfirm(false);
    try {
      const payloadTarget = target === "drive" ? selectedDrive?.id : uploadedTarget;
      if (!payloadTarget) {
        alert("Please select a target first.");
        return;
      }
      
      const response = await fetch("http://127.0.0.1:8000/api/sanitize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: payloadTarget,
        }),
      });

      const data = await response.json();
      setResult(data);
      console.log("Sanitization API Response:", data);

      if (data.success) {
        setStarted(true);
        alert(`✅ SANITIZATION SUCCESSFUL!\n\n${data.message}\n\n📄 Certificate Generated:\n${data.certificate_path}\n\nYou can view your reports in the "data/reports" folder.`);
      } else {
        setStarted(false);
        const errorMsg = data.message || data.error || data.result;
        alert(`Sanitization failed: ${errorMsg}`);
        console.error("Sanitization failed:", errorMsg);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Could not connect to the sanitization engine.");
    }
  }

  return (
    <div className="content">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title">
          <button className="back-button">←</button>
          <div>
            <h1>Data Sanitization</h1>
            <p>Secure. Permanent. Verifiable.</p>
          </div>
        </div>
        <button className="audit-button">
          ▤ &nbsp; View Audit Logs
        </button>
      </div>

      {/* TARGET CARDS */}
      <div className="target-grid">
        <button
          className={`target-card ${target === "drive" ? "selected" : ""}`}
          onClick={() => setTarget("drive")}
        >
          <div className="target-icon">▰</div>
          <div className="target-radio">
            {target === "drive" ? "✓" : ""}
          </div>
          <h3>Disk / Drive</h3>
          <p>Sanitize entire HDD, SSD or external drives</p>
        </button>

        <button
          className={`target-card ${target === "file" ? "selected" : ""}`}
          onClick={() => {
            setTarget("file");
            document.getElementById("file-input").click();
          }}
        >
          <div className="target-icon">▱</div>
          <div className="target-radio">
            {target === "file" ? "✓" : ""}
          </div>
          <h3>File / Folder</h3>
          <p>Securely erase selected files or folders</p>
        </button>

        <button
          className={`target-card ${target === "image" ? "selected" : ""}`}
          onClick={() => setTarget("image")}
        >
          <div className="target-icon">▣</div>
          <div className="target-radio">
            {target === "image" ? "✓" : ""}
          </div>
          <h3>Disk Image</h3>
          <p>Sanitize disk image files (e.g. .img, .dd)</p>
        </button>

        <button
          className={`target-card ${target === "removable" ? "selected" : ""}`}
          onClick={() => setTarget("removable")}
        >
          <div className="target-icon">♧</div>
          <div className="target-radio">
            {target === "removable" ? "✓" : ""}
          </div>
          <h3>Removable Media</h3>
          <p>Sanitize USB drives, SD cards, etc.</p>
        </button>

        <input
          id="file-input"
          type="file"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {selectedFile && (
          <div className="selected-file">
            Selected: {selectedFile.name}
          </div>
        )}
      </div>

      {/* TWO COLUMN AREA */}
      <div className="main-grid">
        {/* LEFT */}
        <section>
          {/* CONFIGURATION */}
          <div className="panel configuration">
            <div className="panel-title">
              <span>⚙</span>
              <h2>Sanitization Configuration</h2>
            </div>
            <div className="config-grid">
              <div className="config-left">
                <label>Select Drive / Device</label>
                <select 
                  className="select-box"
                  style={{width: "100%", padding: "10px", background: "#1c2431", color: "white", border: "1px solid #2a3441", borderRadius: "8px"}}
                  value={selectedDrive?.id || ""}
                  onChange={(e) => {
                    const drive = drives.find(d => d.id === e.target.value);
                    if (drive) setSelectedDrive(drive);
                  }}
                >
                  {drives.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.size_gb} GB)</option>
                  ))}
                </select>
                <div className="device-info">
                  <div>
                    <span>Model</span>
                    <strong>{selectedDrive ? selectedDrive.name : "N/A"}</strong>
                  </div>
                  <div>
                    <span>Serial</span>
                    <strong>{selectedDrive ? selectedDrive.id : "N/A"}</strong>
                  </div>
                  <div>
                    <span>Capacity</span>
                    <strong>{selectedDrive ? selectedDrive.size_gb + " GB" : "N/A"}</strong>
                  </div>
                  <div>
                    <span>Type</span>
                    <strong>Disk / Drive</strong>
                  </div>
                </div>

                <label>Sanitization Method</label>
                <select
                  className="method-select"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option>NIST 800-88 (Clear)</option>
                  <option>DoD 5220.22-M</option>
                  <option>Secure Delete</option>
                  <option>3-Pass Overwrite</option>
                </select>
                <div className="method-description">
                  Overwrites all accessible data with zeroes.
                  Recommended for general use.
                </div>
              </div>

              {/* ADVANCED OPTIONS */}
              <div className="advanced">
                <h3>Advanced Options</h3>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={verify}
                    onChange={(e) => setVerify(e.target.checked)}
                  />
                  Verify after sanitization
                </label>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={certificate}
                    onChange={(e) => setCertificate(e.target.checked)}
                  />
                  Generate sanitization certificate
                </label>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={audit}
                    onChange={(e) => setAudit(e.target.checked)}
                  />
                  Create audit log entry
                </label>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={eject}
                    onChange={(e) => setEject(e.target.checked)}
                  />
                  Eject drive after completion
                </label>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={hardware}
                    onChange={(e) => setHardware(e.target.checked)}
                  />
                  Use hardware secure erase (if available)
                </label>

                <div className="warning">
                  <div className="warning-icon">!</div>
                  <div>
                    <strong>Warning</strong>
                    <div style={{color: '#bdacb7', fontSize: '11px', marginTop: '5px'}}>
                      This prototype sanitizes only the selected
                      controlled disk-image file. The operation
                      cannot be undone.
                    </div>
                  </div>
                </div>
                <button
                  className="start-button"
                  onClick={handleStartClick}
                >
                  ▶ &nbsp; Start Sanitization
                </button>
              </div>
            </div>
          </div>

          {/* RECENT OPERATIONS */}
          <div className="panel recent">
            <div className="recent-header">
              <div className="panel-title" style={{marginBottom: 0}}>
                <span>◷</span>
                <h2>Recent Sanitization Operations</h2>
              </div>
              <button style={{background: 'transparent', border: 0, color: '#16a7ff'}}>View All →</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Target</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>07 Sep 2026, 04:12 PM</td>
                  <td>USB_Drive (32 GB)</td>
                  <td>DoD 5220.22-M</td>
                  <td>
                    <span className="status success">● Completed</span>
                  </td>
                  <td>▤</td>
                </tr>
                <tr>
                  <td>06 Sep 2026, 11:23 AM</td>
                  <td>evidence.img (10 GB)</td>
                  <td>NIST 800-88</td>
                  <td>
                    <span className="status success">● Completed</span>
                  </td>
                  <td>▤</td>
                </tr>
                <tr>
                  <td>05 Sep 2026, 02:41 PM</td>
                  <td>Project_Folder</td>
                  <td>Secure Delete</td>
                  <td>
                    <span className="status success">● Completed</span>
                  </td>
                  <td>▤</td>
                </tr>
                <tr>
                  <td>04 Sep 2026, 10:18 AM</td>
                  <td>External HDD (1 TB)</td>
                  <td>3-Pass Overwrite</td>
                  <td>
                    <span className="status failed">● Failed</span>
                  </td>
                  <td>▤</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <aside className="right-column">
          {/* DRIVE INFO */}
          <div className="panel side-panel">
            <h2>▰ &nbsp; Drive Information</h2>
            <div className="drive-details">
              <div>
                <span>Model</span>
                <strong>{selectedDrive ? selectedDrive.name : (selectedFile ? selectedFile.name : "N/A")}</strong>
              </div>
              <div>
                <span>Serial</span>
                <strong>{selectedDrive ? selectedDrive.id : "N/A"}</strong>
              </div>
              <div>
                <span>Capacity</span>
                <strong>{selectedDrive ? selectedDrive.size_gb + " GB" : "N/A"}</strong>
              </div>
              <div>
                <span>Type</span>
                <strong>{target === "drive" ? "Disk / Drive" : "File / Image"}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong className="ready">● &nbsp; Ready</strong>
              </div>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="panel side-panel">
            <h2>◷ &nbsp; Sanitization Progress</h2>
            <div className="progress-circle">
              <div>
                <strong>{result?.success ? "100%" : started ? "5%" : "0%"}</strong>
                <span>
                  {result?.success ? "Completed" : started ? "Running" : "Not Started"}
                </span>
              </div>
            </div>
            {result && (
              <div className="sanitization-result" style={{fontSize: '12px', color: '#c7d5e5', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px'}}>
                <strong style={{color: result.success ? '#00d8a1' : '#ff626b'}}>
                  {result.success ? "✓ Sanitization Successful" : "✗ Sanitization Failed"}
                </strong>
                <span>Target: {result.target}</span>
                <span>Media: {result.media_type} · Method: {result.method}</span>
                <span>SHA-256: {result.pre_sanitization_sha256}</span>
                <span>Verification: {result.verification_status}</span>
                <span>Audit Log: {result.audit_log}</span>
              </div>
            )}
            <div className="progress-stats">
              <div>
                <span>Elapsed Time</span>
                <strong>00:00:00</strong>
              </div>
              <div>
                <span>Estimated Time</span>
                <strong>--:--:--</strong>
              </div>
              <div>
                <span>Current Operation</span>
                <strong>{result?.success ? "Sanitization Complete" : started ? "Preparing" : "-"}</strong>
              </div>
            </div>
            <div className="progress-bar">
              <div className={result?.success ? "progress-fill started completed" : started ? "progress-fill started" : ""}></div>
            </div>
          </div>

          {/* VERIFICATION */}
          <div className="panel side-panel">
            <h2>◆ &nbsp; Post-Sanitization Verification</h2>
            <div className="verification-list">
              <div>
                <span className="verify-check">✓</span>
                Scan for residual data
                <small>{result ? result.verification_status : "Pending"}</small>
              </div>
              <div>
                <span className="verify-check">✓</span>
                Verify sanitization effectiveness
                <small>{result ? result.verification_status : "Pending"}</small>
              </div>
              <div>
                <span className="verify-check">✓</span>
                Generate verification report
                <small>{result ? result.verification_status : "Pending"}</small>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="panel side-panel">
            <h2>◆ &nbsp; Quick Actions</h2>
            <div className="quick-actions">
              <button>
                <span>▤</span>
                View Reports
              </button>
              <button>
                <span>◉</span>
                Certificates
              </button>
              <button>
                <span>◆</span>
                Sanitization Guidelines
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="modal-content" style={{background: '#1c2431', padding: '30px', borderRadius: '10px', maxWidth: '500px', border: '1px solid #ff626b'}}>
            <h2 style={{color: '#ff626b', marginTop: 0}}>⚠️ Confirm Sanitization</h2>
            <p>You are about to permanently securely erase the following target:</p>
            <strong style={{display: 'block', margin: '15px 0', padding: '10px', background: '#0d131f', borderRadius: '5px'}}>
              {target === "drive" ? selectedDrive?.id : uploadedTarget}
            </strong>
            <p style={{color: '#bdacb7', fontSize: '14px'}}>This action CANNOT be undone. The backend safety firewall will also perform a final validation before proceeding.</p>
            <div style={{display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end'}}>
              <button onClick={() => setShowConfirm(false)} style={{padding: '10px 20px', background: 'transparent', border: '1px solid #2a3441', color: 'white', borderRadius: '5px', cursor: 'pointer'}}>Cancel</button>
              <button onClick={startSanitization} style={{padding: '10px 20px', background: '#ff626b', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>Proceed with Erase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
